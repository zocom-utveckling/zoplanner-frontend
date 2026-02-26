import { useEffect, useState } from "react";
import { fetchSchedulerEvents } from "./schedulerData";

export default function useSchedulerEvents(user) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  function addEvent(newEvent) {
    setEvents((prev) => [...prev, newEvent]);
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
        const nextEvents = await fetchSchedulerEvents(user);
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
  }, [user?.id]);

  return {
    events,
    loading,
    addEvent,
  };
}
