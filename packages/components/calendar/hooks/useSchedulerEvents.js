import { useEffect, useState } from "react";
import { fetchSchedulerEvents } from "../data/schedulerData";
import {
  listLocalActivities,
  removeLocalActivity,
  saveLocalActivity,
  subscribeToLocalActivityChanges,
} from "../data/localActivityStorage";

function isLocalEvent(eventItem) {
  return eventItem?.source === "local";
}

function mergeWithLocalEvents(remoteEvents, userId) {
  return [...remoteEvents, ...listLocalActivities(userId)];
}

export default function useSchedulerEvents(user, options = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  function addEvent(newEvent) {
    if (!newEvent) return;

    let eventToAdd = newEvent;
    if (user?.id) {
      const savedEvent = saveLocalActivity(user.id, {
        ...newEvent,
        source: "local",
      });
      if (savedEvent) {
        eventToAdd = savedEvent;
      }
    }

    setEvents((prev) => [...prev, eventToAdd]);
  }

  function removeEvent(eventId) {
    if (user?.id) {
      removeLocalActivity(user.id, eventId);
    }
    setEvents((prev) => prev.filter((eventItem) => eventItem.id !== eventId));
  }

  function updateEvent(updatedEvent) {
    if (!updatedEvent?.id) return;
    setEvents((prev) =>
      prev.map((eventItem) =>
        eventItem.id === updatedEvent.id
          ? { ...eventItem, ...updatedEvent }
          : eventItem,
      ),
    );
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
        if (!isCancelled) setEvents(mergeWithLocalEvents(nextEvents, user.id));
      } catch {
        if (!isCancelled) setEvents(mergeWithLocalEvents([], user.id));
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      isCancelled = true;
    };
  }, [user?.id, options?.includeAllConsultants]);

  useEffect(() => {
    if (!user?.id) return () => {};

    return subscribeToLocalActivityChanges((changedUserId) => {
      if (String(changedUserId) !== String(user.id)) return;

      setEvents((prev) => {
        const remoteEvents = prev.filter((eventItem) => !isLocalEvent(eventItem));
        return [...remoteEvents, ...listLocalActivities(user.id)];
      });
    });
  }, [user?.id]);

  return {
    events,
    loading,
    addEvent,
    removeEvent,
    updateEvent,
  };
}
