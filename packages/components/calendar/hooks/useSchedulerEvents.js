import { useEffect, useState } from "react";
import { fetchSchedulerEvents } from "../data/schedulerData";

export default function useSchedulerEvents(user, options = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  function addEvent(newEvent) {
    setEvents((prev) => [...prev, newEvent]);
  }

  function removeEvent(eventId) {
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
