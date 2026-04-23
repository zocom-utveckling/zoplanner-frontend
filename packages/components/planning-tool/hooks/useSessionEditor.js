import { useState } from "react";
import { format } from "date-fns";
import { activityService } from "@zoplanner/api";

export function useSessionEditor({
  courseDraft,
  setCourseDraft,
  selectedConsultant,
  setConsultantActivities,
}) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  function handleSessionClick(sessionIndex) {
    if (!courseDraft?.sessionsDraft?.[sessionIndex]) return;

    const session = courseDraft.sessionsDraft[sessionIndex];

    setSelectedSession(sessionIndex);
    setFormData({
      title: session.title ?? session.comment ?? "",
      date: session.dateStart ?? "",
      startTime: session.timeStart?.split("T")[1]?.slice(0, 5) ?? "",
      endTime: session.timeEnd?.split("T")[1]?.slice(0, 5) ?? "",
      location: session.location ?? "ONSITE",
      requestChange: false,
    });
    setIsModalOpen(true);
  }

  function handleSessionFormChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSessionSubmit(event) {
    event.preventDefault();

    if (selectedSession === null || !courseDraft) return;

    const updatedSessions = [...(courseDraft.sessionsDraft ?? [])];
    const currentSession = updatedSessions[selectedSession];

    if (!currentSession) return;

    updatedSessions[selectedSession] = {
      ...currentSession,
      title: formData.title,
      comment: formData.title,
      dateStart: formData.date,
      dateEnd: formData.date,
      timeStart: `${formData.date}T${formData.startTime}:00`,
      timeEnd: `${formData.date}T${formData.endTime}:00`,
      location: formData.location,
    };

    setCourseDraft({
      ...courseDraft,
      sessionsDraft: updatedSessions,
    });

    if (formData.requestChange && selectedConsultant?.id) {
      const payload = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        title: "Förfrågan om ändring",
        type: "other",
        description:
          formData.requestComment ||
          "Jag ser att du har en bokning här – finns det möjlighet att justera så att du kan ta detta pass?",
        userId: selectedConsultant.userId,
      };

      console.log("🚀 Activity payload:", payload);
      activityService
        .create(payload)
        .then((res) => {
          console.log("✅ SUCCESS:", res);

          const newActivity = res;

          setConsultantActivities((prev) => [...prev, newActivity]);
        })
        .catch((error) => {
          console.error("❌ ERROR:", error);
        });
    }

    setIsModalOpen(false);
    setSelectedSession(null);
    setFormData(null);
  }

  function handleSessionModalClose() {
    setIsModalOpen(false);
    setSelectedSession(null);
    setFormData(null);
  }

  function handleEventDrop(sessionIndex, newDate) {
    if (!courseDraft?.sessionsDraft?.[sessionIndex]) return;

    const updatedSessions = [...courseDraft.sessionsDraft];
    const session = updatedSessions[sessionIndex];

    const newDateString = format(newDate, "yyyy-MM-dd");

    const oldStartTime =
      session.timeStart?.split("T")[1]?.slice(0, 8) ?? "09:00:00";
    const oldEndTime =
      session.timeEnd?.split("T")[1]?.slice(0, 8) ?? "12:00:00";

    updatedSessions[sessionIndex] = {
      ...session,
      dateStart: newDateString,
      dateEnd: newDateString,
      timeStart: `${newDateString}T${oldStartTime}`,
      timeEnd: `${newDateString}T${oldEndTime}`,
    };

    setCourseDraft({
      ...courseDraft,
      sessionsDraft: updatedSessions,
    });
  }

  return {
    isModalOpen,
    formData,
    handleSessionClick,
    handleSessionFormChange,
    handleSessionSubmit,
    handleSessionModalClose,
    handleEventDrop,
  };
}