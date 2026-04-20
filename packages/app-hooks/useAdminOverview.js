import { useEffect, useState } from "react";
import {
  activityService,
  assignmentService,
  consultantService,
} from "@zoplanner/api";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 5);

  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSameDay(dateValue) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function normalizeActivity(activity) {
  return {
    id: `activity-${activity.id}`,
    title: activity.title,
    type: "Aktivitet",
    startTime: formatTime(activity.startTime),
    endTime: formatTime(activity.endTime),
    sortValue: activity.startTime,
    note: activity.description || "",
  };
}

function normalizeSession(session, assignment) {
  const fallbackTitle =
    session.title || assignment?.course?.name || "Session";

  return {
    id: `session-${session.id}`,
    title: fallbackTitle,
    type: "Session",
    startTime: formatTime(session.timeStart),
    endTime: formatTime(session.timeEnd),
    sortValue: session.timeStart,
    location: session.location,
    note: session.comment || "",
  };
}
function normalizeIncompleteAssignment(assignment) {
  const title = assignment.course?.name || "Namnlös kurs";
  const items = [];

  if (!assignment.consultantId) {
    items.push({
      id: `incomplete-${assignment.id}-consultant`,
      assignmentId: assignment.id,
      courseId: assignment.course?.id,
      assignment,
      title,
      issue: "Ingen konsult vald",
    });
  }

  if (!assignment.course?.classId) {
    items.push({
      id: `incomplete-${assignment.id}-class`,
      assignmentId: assignment.id,
      courseId: assignment.course?.id,
      assignment,
      title,
      issue: "Ingen kund/kursklass vald",
    });
  }

  if (!assignment.course?.dateStart || !assignment.course?.dateEnd) {
    items.push({
      id: `incomplete-${assignment.id}-dates`,
      assignmentId: assignment.id,
      courseId: assignment.course?.id,
      assignment,
      title,
      issue: "Saknar datum",
    });
  }

  if (!assignment.sessions || assignment.sessions.length === 0) {
    items.push({
      id: `incomplete-${assignment.id}-sessions`,
      assignmentId: assignment.id,
      courseId: assignment.course?.id,
      assignment,
      title,
      issue: "Inga sessions skapade",
    });
  }

  return items;
}
export function useAdminOverview(user) {
  const [data, setData] = useState({
    planningItems: [],
    incompleteItems: [],
    isLoading: true,
    error: "",
  });

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function load() {
      try {
        const [activities, assignments, consultants] = await Promise.all([
          activityService.getAll(),
          assignmentService.getAll(),
          consultantService.getAll(),
        ]);

        if (!isMounted) return;

        const consultant = (consultants ?? []).find(
          (c) => c.userId === user.id
        );

        const todayActivities = (activities ?? [])
          .filter((a) => isSameDay(a.date))
          .map(normalizeActivity);

        const todaySessions = (assignments ?? [])
          .filter((a) => consultant && a.consultantId === consultant.id)
          .flatMap((a) =>
            (a.sessions ?? [])
              .filter((s) => isSameDay(s.timeStart))
              .map((s) => normalizeSession(s, a))
          );

        const planningItems = [...todayActivities, ...todaySessions].sort(
          (a, b) => String(a.sortValue).localeCompare(String(b.sortValue))
        );

        const incompleteItems = (assignments ?? []).flatMap(
  normalizeIncompleteAssignment
);

        setData({
          planningItems,
          incompleteItems,
          isLoading: false,
          error: "",
        });
      } catch (err) {
        if (!isMounted) return;

        setData({
          planningItems: [],
          incompleteItems: [],
          isLoading: false,
          error: "Kunde inte ladda översikten",
        });
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return data;
}