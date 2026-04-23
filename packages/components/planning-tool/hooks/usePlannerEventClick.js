import { useCallback } from "react";
import { activityService } from "@zoplanner/api";

export function usePlannerEventClick({
  handleSessionClick,
  consultantActivities,
  setConsultantActivities,
}) {
  const handleEventClick = useCallback(
    (event) => {
      if (event.type === "assignment-session") {
        handleSessionClick(event.sessionIndex);
        return;
      }

      if (event.type === "consultant-request") {
        const accepted = window.confirm(
          `${event.title}\n\n${event.description || ""}\n\nOK = Godkänn\nAvbryt = Avböj`,
        );

        const activityId = event.activityId;

        const original = consultantActivities.find(
          (a) => String(a.id) === String(activityId),
        );

        if (!original) return;

        const cleanTitle = original.title.replace(/^Godkänd: |^Avböjd: /, "");

        const newTitle = accepted
          ? `Godkänd: ${cleanTitle}`
          : `Avböjd: ${cleanTitle}`;

        activityService
          .update(activityId, {
            title: newTitle,
          })
          .then(() => {
            setConsultantActivities((prev) =>
              prev.map((a) =>
                String(a.id) === String(activityId)
                  ? { ...a, title: newTitle }
                  : a,
              ),
            );
          });
      }
    },
    [consultantActivities, handleSessionClick, setConsultantActivities],
  );

  return {
    handleEventClick,
  };
}