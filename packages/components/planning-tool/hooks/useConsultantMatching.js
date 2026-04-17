import { useEffect, useState } from "react";
import {
  consultantService,
  activityService,
  userService,
} from "@zoplanner/api";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function getDisplayName(consultant, user) {
  return firstNonEmptyString(
    consultant?.name,
    consultant?.Name,
    consultant?.fullName,
    consultant?.FullName,
    [consultant?.firstName, consultant?.lastName].filter(Boolean).join(" "),
    [consultant?.FirstName, consultant?.LastName].filter(Boolean).join(" "),
    user?.name,
    user?.Name,
    user?.fullName,
    user?.FullName,
    [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    [user?.FirstName, user?.LastName].filter(Boolean).join(" "),
    user?.username,
    user?.Username,
    "Namn saknas",
  );
}

export function useConsultantMatching() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConsultantsWithActivities() {
      try {
        const [consultantRes, activityRes, userRes] = await Promise.all([
          consultantService.getAll(),
          activityService.getAll(),
          userService.getAll(),
        ]);

        const consultantData = toArray(consultantRes);
        const allActivities = toArray(activityRes);
        const users = toArray(userRes);

        const userById = new Map(users.map((user) => [user?.id, user]));

        const enrichedConsultants = consultantData.map((consultant) => {
          const linkedUser = userById.get(consultant?.userId);

          return {
            ...consultant,
            name: getDisplayName(consultant, linkedUser),
            subject: firstNonEmptyString(
              consultant?.subject,
              consultant?.Subject,
              consultant?.specialty,
              consultant?.Specialty,
            ),
            activities: allActivities.filter(
              (activity) =>
                String(activity?.userId) === String(consultant?.userId),
            ),
            sessions: [],
          };
        });

        setConsultants(enrichedConsultants);
      } catch (error) {
        console.error("Failed to load consultant matching data:", error);
        setConsultants([]);
      } finally {
        setLoading(false);
      }
    }

    loadConsultantsWithActivities();
  }, []);

  return {
    consultants,
    loading,
  };
}