import { useEffect, useState } from "react";
import { activityService, assignmentService } from "@zoplanner/api";

function useProfileData(user, consultantId) {
  const [assignments, setAssignments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoadingSidebarData, setIsLoadingSidebarData] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadProfileLists() {
      if (!user?.id) {
        setActivities([]);
        setAssignments([]);
        return;
      }

      setIsLoadingSidebarData(true);

      try {
        const activitiesPromise = activityService.getAll();
        const assignmentsPromise = consultantId
          ? assignmentService.getByConsultantId(consultantId)
          : Promise.resolve([]);

        const [allActivities, consultantAssignments] = await Promise.all([
          activitiesPromise,
          assignmentsPromise,
        ]);

        if (isCancelled) return;

        const filteredActivities = Array.isArray(allActivities)
          ? allActivities.filter((activity) => activity?.userId === user.id)
          : [];

        const normalizedAssignments = Array.isArray(consultantAssignments)
          ? consultantAssignments
          : [];

        setActivities(filteredActivities);
        setAssignments(normalizedAssignments);
      } catch {
        if (isCancelled) return;
        setActivities([]);
        setAssignments([]);
      } finally {
        if (!isCancelled) {
          setIsLoadingSidebarData(false);
        }
      }
    }

    loadProfileLists();

    return () => {
      isCancelled = true;
    };
  }, [user?.id, consultantId]);

  return {
    assignments,
    activities,
    isLoadingSidebarData,
  };
}

export { useProfileData };
