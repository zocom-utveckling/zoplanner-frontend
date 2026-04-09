import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:5027/api";

const ACCESS = {
  ADMIN: "admin",
  SCHEDULE: "schedule",
  MANAGER: "manager",
  CONSULTANT: "consultant",
};

export function useCurrentActor(user) {
  const [managerId, setManagerId] = useState(null);
  const [consultantId, setConsultantId] = useState(null);
  const [isLoadingActor, setIsLoadingActor] = useState(false);
  const [actorError, setActorError] = useState(null);

  const userId = user?.id ?? null;
  const role = user?.role ?? null;

  useEffect(() => {
    let isMounted = true;

    async function loadActorIds() {
      if (!userId) {
        setManagerId(null);
        setConsultantId(null);
        setActorError(null);
        setIsLoadingActor(false);
        return;
      }

      setIsLoadingActor(true);
      setActorError(null);

      try {
        const [managerRes, consultantRes] = await Promise.all([
          fetch(`${API_BASE_URL}/Manager`),
          fetch(`${API_BASE_URL}/Consultant`),
        ]);

        if (!managerRes.ok || !consultantRes.ok) {
          throw new Error("Kunde inte hämta actor-data");
        }

        const [managers, consultants] = await Promise.all([
          managerRes.json(),
          consultantRes.json(),
        ]);

        if (!isMounted) return;

        const matchedManager = Array.isArray(managers)
          ? managers.find((manager) => manager.userId === userId)
          : null;

        const matchedConsultant = Array.isArray(consultants)
          ? consultants.find((consultant) => consultant.userId === userId)
          : null;

        setManagerId(matchedManager?.id ?? null);
        setConsultantId(matchedConsultant?.id ?? null);
      } catch (error) {
        if (!isMounted) return;

        console.error("useCurrentActor error:", error);
        setManagerId(null);
        setConsultantId(null);
        setActorError(error);
      } finally {
        if (isMounted) {
          setIsLoadingActor(false);
        }
      }
    }

    loadActorIds();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const derivedAccess = useMemo(() => {
    const isManager = !!managerId;
    const isConsultant = !!consultantId;
    const isBoth = isManager && isConsultant;

    function canAccess(resource) {
      switch (resource) {
        case ACCESS.ADMIN:
        case ACCESS.SCHEDULE:
        case ACCESS.MANAGER:
          return isManager;

        case ACCESS.CONSULTANT:
          return isConsultant;

        default:
          return false;
      }
    }

    return {
      isManager,
      isConsultant,
      isBoth,
      canAccess,
    };
  }, [managerId, consultantId]);

  return {
    user,
    userId,
    role,
    managerId,
    consultantId,
    isLoadingActor,
    actorError,
    access: ACCESS,
    ...derivedAccess,
  };
}