import { useState } from "react";

export default function useEventDetailsModal() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  function handleOpenEventModal(event) {
    setSelectedEvent(event);
  }

  function handleCloseEventModal() {
    setSelectedEvent(null);
  }

  return {
    selectedEvent,
    handleOpenEventModal,
    handleCloseEventModal,
  };
}
