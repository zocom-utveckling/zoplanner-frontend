import { useState } from "react";
import { format } from "date-fns";
import { toLocalDateTime } from "./schedulerData";

const initialFormData = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  type: "meeting",
};

export default function useActivityForm({ onCreateEvent, onDateSelected }) {
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityFormData, setActivityFormData] = useState(initialFormData);

  function resetForm() {
    setActivityFormData(initialFormData);
  }

  function handleOpenActivityModal(date) {
    const selectedDate = format(date, "yyyy-MM-dd");
    onDateSelected(date);
    setActivityFormData({
      ...initialFormData,
      date: selectedDate,
    });
    setIsActivityModalOpen(true);
  }

  function handleCloseActivityModal() {
    setIsActivityModalOpen(false);
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

    if (start && end) {
      onCreateEvent({
        id: `manual-${Date.now()}`,
        title: activityFormData.title,
        subtitle: activityFormData.description,
        start,
        end,
        type: activityFormData.type || "manual",
      });
    }

    resetForm();
    setIsActivityModalOpen(false);
  }

  return {
    isActivityModalOpen,
    activityFormData,
    handleOpenActivityModal,
    handleCloseActivityModal,
    handleActivityChange,
    handleActivitySubmit,
  };
}
