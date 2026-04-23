import { useEffect, useMemo, useState } from "react";
import { assignmentService, activityService } from "@zoplanner/api";
import { toArray } from "../utils/array.helpers";
import { toDateTime, toActivityDateTime } from "../utils/dateTime.helpers";

export function useConsultantSchedule(selectedConsultant) {
  const [consultantAssignmentEvents, setConsultantAssignmentEvents] = useState(
    [],
  );
  const [consultantActivities, setConsultantActivities] = useState([]);
  const [isLoadingConsultantSchedule, setIsLoadingConsultantSchedule] =
    useState(false);

  useEffect(() => {
    if (!selectedConsultant?.id || !selectedConsultant?.userId) {
      setConsultantAssignmentEvents([]);
      setConsultantActivities([]);
      setIsLoadingConsultantSchedule(false);
      return;
    }

    let isCancelled = false;

    async function loadConsultantActivities(consultantUserId) {
      try {
        const response = await activityService.getAll();
        const activities = Array.isArray(response)
          ? response
          : (response.data ?? []);

        const filtered = activities.filter((a) => a.userId === consultantUserId);

        if (!isCancelled) {
          setConsultantActivities(filtered);
        }
      } catch (error) {
        console.error("Failed to load activities:", error);

        if (!isCancelled) {
          setConsultantActivities([]);
        }
      }
    }

    async function loadConsultantAssignments() {
      setIsLoadingConsultantSchedule(true);

      try {
        const assignmentResponse = await assignmentService.getByConsultantId(
          selectedConsultant.id,
        );
        console.log("ASSIGNMENTS:", assignmentResponse);

        const assignments = toArray(assignmentResponse);
        const scheduleEvents = assignments.flatMap(
          (assignment, assignmentIndex) =>
            toArray(assignment?.sessions)
              .filter((session) => session?.timeStart && session?.timeEnd)
              .map((session, sessionIndex) => ({
                id: `consultant-session-${selectedConsultant.id}-${assignment?.id ?? assignmentIndex}-${session?.id ?? sessionIndex}`,
                title:
                  session.comment ||
                  session.title ||
                  assignment?.course?.name ||
                  "Bokad session",
                type: "consultant-session",
                start: new Date(session.timeStart),
                end: new Date(session.timeEnd),
                draggable: false,
              })),
        );

        if (!isCancelled) {
          setConsultantAssignmentEvents(scheduleEvents);
        }
      } catch (error) {
        console.error("Failed to load consultant assignments:", error);

        if (!isCancelled) {
          setConsultantAssignmentEvents([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingConsultantSchedule(false);
        }
      }
    }

    loadConsultantActivities(selectedConsultant.userId);
    loadConsultantAssignments();

    return () => {
      isCancelled = true;
    };
  }, [selectedConsultant?.id, selectedConsultant?.userId]);

  const consultantActivityEvents = useMemo(() => {
    if (!consultantActivities?.length || !selectedConsultant?.id) return [];

    return consultantActivities
      .map((activity) => {
        const start =
          toDateTime(activity?.timeStart) ||
          toActivityDateTime(activity?.date, activity?.startTime);

        const end =
          toDateTime(activity?.timeEnd) ||
          toActivityDateTime(activity?.date, activity?.endTime);

        if (!start || !end || end <= start) return null;

        const baseTitle =
          activity.title || activity.name || activity.description || "Aktivitet";

        const cleanTitle = baseTitle.replace(/^Godkänd: |^Avböjd: /, "");

        const isAccepted = baseTitle.startsWith("Godkänd:");
        const isDeclined = baseTitle.startsWith("Avböjd:");
        const isRequest = cleanTitle === "Förfrågan om ändring";

        return {
          id: `activity-${selectedConsultant.id}-${activity.id}`,
          activityId: activity.id,
          isRequest,
          title: isRequest
            ? isAccepted
              ? `✅ ${cleanTitle}`
              : isDeclined
                ? `❌ ${cleanTitle}`
                : `⚠️ ${cleanTitle}`
            : cleanTitle,
          type: isRequest
            ? isAccepted
              ? "consultant-request-accepted"
              : isDeclined
                ? "consultant-request-declined"
                : "consultant-request"
            : "consultant-activity",
          start,
          end,
          draggable: false,
        };
      })
      .filter(Boolean);
  }, [consultantActivities, selectedConsultant]);

  return {
    consultantAssignmentEvents,
    setConsultantAssignmentEvents,
    consultantActivities,
    setConsultantActivities,
    isLoadingConsultantSchedule,
    consultantActivityEvents,
  };
}