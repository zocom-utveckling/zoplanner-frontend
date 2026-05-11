import { useEffect, useState } from "react";
import { activityService } from "@zoplanner/api";
import { fetchSchedulerEvents } from "../data/schedulerData";
import {
  toDatePart,
  toLocalDateTime,
  toTimePart,
} from "../utils/dateTimeUtils";
import {
  ACTIVITIES_UPDATED_EVENT,
  emitActivitiesUpdated,
} from "../utils/activityEvents";
import {
  DEFAULT_ACTIVITY_COLOR,
  normalizeActivityColor,
} from "@zoplanner/activity-creation";

const ACTIVITY_COLOR_STORAGE_KEY = "zoplanner:activity-color-map:v1";

function readActivityColorMap() {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(ACTIVITY_COLOR_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeActivityColorMap(colorMap) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      ACTIVITY_COLOR_STORAGE_KEY,
      JSON.stringify(colorMap || {}),
    );
  } catch {
    // no-op
  }
}

function applyStoredColor(eventItem, colorMap) {
  if (!eventItem || eventItem.source !== "activity") return eventItem;

  const eventKey = String(eventItem.id ?? "");
  const storedColor = colorMap?.[eventKey];

  return {
    ...eventItem,
    color: normalizeActivityColor(
      storedColor ?? eventItem?.color ?? DEFAULT_ACTIVITY_COLOR,
    ),
  };
}

function toEventFromActivity(activity, fallbackEvent) {
  if (!activity) return fallbackEvent;

  const start =
    activity?.date && activity?.startTime
      ? toLocalDateTime(`${activity.date} ${activity.startTime}:00`)
      : null;

  const end =
    activity?.date && activity?.endTime
      ? toLocalDateTime(`${activity.date} ${activity.endTime}:00`)
      : null;

  const baseTitle = activity?.title || fallbackEvent?.title || "Aktivitet";

  const cleanTitle = baseTitle.replace(/^Godkänd: |^Avböjd: /, "");

  const isRequest =
    typeof baseTitle === "string" && cleanTitle === "Förfrågan om ändring";

  return {
    ...fallbackEvent,
    id: activity?.id ?? fallbackEvent?.id,
    title: baseTitle,
    subtitle: activity?.description ?? fallbackEvent?.subtitle,
    description: activity?.description ?? fallbackEvent?.description,
    start: start || fallbackEvent?.start,
    end: end || fallbackEvent?.end,
    type: activity?.type ?? fallbackEvent?.type,
    color: normalizeActivityColor(
      activity?.color ?? fallbackEvent?.color ?? DEFAULT_ACTIVITY_COLOR,
    ),
    isRequest,
  };
}

function toActivityPayload(eventItem, userId) {
  return {
    title: eventItem?.title || "Aktivitet",
    type: eventItem?.type || "meeting",
    date: toDatePart(eventItem?.start),
    startTime: toTimePart(eventItem?.start),
    endTime: toTimePart(eventItem?.end),
    description: eventItem?.description || eventItem?.subtitle || "",
    ...(userId ? { userId } : {}),
  };
}

function unwrapEntity(response) {
  if (response && typeof response === "object" && response.data) {
    return response.data;
  }

  return response;
}

export default function useSchedulerEvents(user, options = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [, setActivityColorMap] = useState(() => readActivityColorMap());

  function upsertActivityColor(eventId, color) {
    if (eventId == null) return normalizeActivityColor(color);

    const eventKey = String(eventId);
    const normalizedColor = normalizeActivityColor(
      color || DEFAULT_ACTIVITY_COLOR,
    );

    setActivityColorMap((prev) => {
      const next = {
        ...prev,
        [eventKey]: normalizedColor,
      };
      writeActivityColorMap(next);
      return next;
    });

    return normalizedColor;
  }

  function removeActivityColor(eventId) {
    if (eventId == null) return;

    const eventKey = String(eventId);

    setActivityColorMap((prev) => {
      if (!(eventKey in prev)) return prev;

      const next = { ...prev };
      delete next[eventKey];
      writeActivityColorMap(next);
      return next;
    });
  }

  async function addEvent(newEvent) {
    if (!newEvent) return;

    if (user?.id) {
      const payload = toActivityPayload(newEvent, user.id);

      try {
        const createdActivity = unwrapEntity(
          await activityService.create(payload),
        );
        const createdEvent = toEventFromActivity(createdActivity, {
          ...newEvent,
          source: "activity",
        });
        const nextColor = upsertActivityColor(
          createdEvent?.id,
          createdEvent?.color || newEvent?.color || DEFAULT_ACTIVITY_COLOR,
        );

        setEvents((prev) => [
          ...prev,
          {
            ...createdEvent,
            color: nextColor,
          },
        ]);
        return { ...createdEvent, color: nextColor };
      } catch {
        return;
      }
    }
  }

  async function removeEvent(eventId) {
    if (!eventId) return;

    const activityId = Number(eventId);
    if (!Number.isFinite(activityId)) return;

    try {
      await activityService.remove(activityId);

      emitActivitiesUpdated(user?.id ?? null);
    } catch {
      return;
    }

    removeActivityColor(eventId);
    setEvents((prev) => prev.filter((eventItem) => eventItem.id !== eventId));
  }

  async function updateEvent(updatedEvent) {
    if (!updatedEvent?.id) return;

    const eventToPersist = updatedEvent;

    const activityId = Number(updatedEvent.id);
    if (!Number.isFinite(activityId)) return;

    const normalizedColor = upsertActivityColor(
      updatedEvent.id,
      updatedEvent?.color || DEFAULT_ACTIVITY_COLOR,
    );

    // Optimistic UI update for immediate color feedback.
    setEvents((prev) =>
      prev.map((eventItem) =>
        eventItem.id === updatedEvent.id
          ? {
              ...eventItem,
              ...updatedEvent,
              color: normalizedColor,
            }
          : eventItem,
      ),
    );

    const payload = toActivityPayload(updatedEvent, user?.id);

    try {
      const updatedActivity = unwrapEntity(
        await activityService.update(activityId, payload),
      );
      emitActivitiesUpdated(user?.id ?? null);
      const nextEvent = toEventFromActivity(updatedActivity, eventToPersist);

      setEvents((prev) =>
        prev.map((eventItem) =>
          eventItem.id === updatedEvent.id
            ? {
                ...eventItem,
                ...nextEvent,
                color: normalizedColor,
              }
            : eventItem,
        ),
      );
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadEvents() {
      if (!user?.id) {
        setEvents([]);
        return;
      }

      setLoading(true);

      try {
        const nextEvents = await fetchSchedulerEvents(user, options);

        if (!isCancelled) {
          const storedColorMap = readActivityColorMap();
          setActivityColorMap(storedColorMap);
          setEvents(
            nextEvents.map((eventItem) =>
              applyStoredColor(eventItem, storedColorMap),
            ),
          );
        }
      } catch {
        if (!isCancelled) setEvents([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      isCancelled = true;
    };
  }, [
    user?.id,
    options?.includeAllConsultants,
    options?.onlyBookedPasses,
    refreshToken,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleActivitiesUpdated(event) {
      const changedUserId = event?.detail?.userId;

      if (options?.includeAllConsultants) {
        setRefreshToken((current) => current + 1);
        return;
      }

      if (!user?.id) return;

      if (changedUserId == null || String(changedUserId) === String(user.id)) {
        setRefreshToken((current) => current + 1);
      }
    }

    window.addEventListener(ACTIVITIES_UPDATED_EVENT, handleActivitiesUpdated);

    return () => {
      window.removeEventListener(
        ACTIVITIES_UPDATED_EVENT,
        handleActivitiesUpdated,
      );
    };
  }, [user?.id, options?.includeAllConsultants]);

  return {
    events,
    loading,
    addEvent,
    removeEvent,
    updateEvent,
  };
}
