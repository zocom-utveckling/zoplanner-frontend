import { useState } from "react";
import { format } from "date-fns";
import { toLocalDateTime } from "../data/schedulerData";

const initialFormData = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  type: "meeting",
};

function toFormDataFromEvent(eventItem) {
  const start = toLocalDateTime(eventItem?.start);
  const end = toLocalDateTime(eventItem?.end);

  return {
    title: eventItem?.title || "",
    description: eventItem?.description || eventItem?.subtitle || "",
    date: start ? format(start, "yyyy-MM-dd") : "",
    startTime: start ? format(start, "HH:mm") : "",
    endTime: end ? format(end, "HH:mm") : "",
    type: eventItem?.type || "meeting",
  };
}

export default function useActivityForm({
  onCreateEvent,
  onDeleteEvent,
  onUpdateEvent,
  onDateSelected,
}) {
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityFormData, setActivityFormData] = useState(initialFormData);
  const [activityModalMode, setActivityModalMode] = useState("create");
  const [editingEventId, setEditingEventId] = useState(null);

  function resetForm() {
    setActivityFormData(initialFormData);
    setActivityModalMode("create");
    setEditingEventId(null);
  }

  function handleOpenActivityModal(date) {
    const selectedDate = format(date, "yyyy-MM-dd");
    onDateSelected(date);
    setActivityFormData({
      ...initialFormData,
      date: selectedDate,
    });
    setActivityModalMode("create");
    setEditingEventId(null);
    setIsActivityModalOpen(true);
  }

  function handleOpenActivityModalForEvent(eventItem) {
    if (!eventItem?.id) return;

    const start = toLocalDateTime(eventItem.start);
    if (start) {
      onDateSelected(start);
    }

    setActivityFormData(toFormDataFromEvent(eventItem));
    setEditingEventId(eventItem.id);
    setActivityModalMode("view");
    setIsActivityModalOpen(true);
  }

  function handleCloseActivityModal() {
    setIsActivityModalOpen(false);
    resetForm();
  }

  function handleStartEditingActivity() {
    if (!editingEventId) return;
    setActivityModalMode("edit");
  }

  function handleDeleteActivity() {
    if (!editingEventId) return;

    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort den här aktiviteten?",
    );
    if (!confirmed) return;

    onDeleteEvent?.(editingEventId);
    handleCloseActivityModal();
  }

  function handleActivityChange(event) {
    const { name, value } = event.target;
    setActivityFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleActivitySubmit(event) {
    event.preventDefault();

    const start = toLocalDateTime(
      `${activityFormData.date} ${activityFormData.startTime}:00`,
    );
    const end = toLocalDateTime(
      `${activityFormData.date} ${activityFormData.endTime}:00`,
    );

    if (!start || !end || end <= start) {
      return;
    }

    if (activityModalMode === "edit" && editingEventId) {
      onUpdateEvent?.({
        id: editingEventId,
        title: activityFormData.title,
        subtitle: activityFormData.description,
        description: activityFormData.description,
        start,
        end,
        type: activityFormData.type || "meeting",
      });
    } else {
      onCreateEvent({
        id: `manual-${Date.now()}`,
        title: activityFormData.title,
        subtitle: activityFormData.description,
        description: activityFormData.description,
        start,
        end,
        type: activityFormData.type || "manual",
      });
    }

    handleCloseActivityModal();
  }

  return {
    isActivityModalOpen,
    activityFormData,
    activityModalMode,
    handleOpenActivityModal,
    handleOpenActivityModalForEvent,
    handleCloseActivityModal,
    handleStartEditingActivity,
    handleDeleteActivity,
    handleActivityChange,
    handleActivitySubmit,
  };
}
