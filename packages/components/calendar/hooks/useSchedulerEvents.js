import { useEffect, useState } from "react";
import { fetchSchedulerEvents, toLocalDateTime } from "../data/schedulerData";

function toDatePart(value) {
  const date = toLocalDateTime(value);
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimePart(value) {
  const date = toLocalDateTime(value);
  if (!date) return null;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
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

  return {
    ...fallbackEvent,
    id: activity?.id ?? fallbackEvent?.id,
    title: activity?.title ?? fallbackEvent?.title,
    subtitle: activity?.description ?? fallbackEvent?.subtitle,
    description: activity?.description ?? fallbackEvent?.description,
    start: start || fallbackEvent?.start,
    end: end || fallbackEvent?.end,
    type: activity?.type ?? fallbackEvent?.type,
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

export default function useSchedulerEvents(user, options = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  async function addEvent(newEvent) {
    if (!newEvent) return;

    if (user?.id) {
      const payload = toActivityPayload(newEvent, user.id);

      try {
        const response = await fetch(`http://localhost:5027/api/Activities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const createdActivity = await response.json().catch(() => null);
          const createdEvent = toEventFromActivity(createdActivity, {
            ...newEvent,
            source: "activity",
          });

          setEvents((prev) => [...prev, createdEvent]);
          return;
        }
        return;
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
      const response = await fetch(
        `http://localhost:5027/api/Activities/${activityId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        return;
      }
    } catch {
      return;
    }

    setEvents((prev) => prev.filter((eventItem) => eventItem.id !== eventId));
  }

  async function updateEvent(updatedEvent) {
    if (!updatedEvent?.id) return;

    const eventToPersist = updatedEvent;

    const activityId = Number(updatedEvent.id);
    if (!Number.isFinite(activityId)) return;

    const payload = toActivityPayload(updatedEvent, user?.id);

    try {
      const response = await fetch(
        `http://localhost:5027/api/Activities/${activityId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        return;
      }

      const updatedActivity = await response.json().catch(() => null);
      const nextEvent = toEventFromActivity(updatedActivity, eventToPersist);

      setEvents((prev) =>
        prev.map((eventItem) =>
          eventItem.id === updatedEvent.id
            ? { ...eventItem, ...nextEvent }
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
        if (!isCancelled) setEvents(nextEvents);
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
  }, [user?.id, options?.includeAllConsultants]);

  return {
    events,
    loading,
    addEvent,
    removeEvent,
    updateEvent,
  };
}
