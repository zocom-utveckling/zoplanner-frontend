export function useAccess(user) {
    const role = user?.role ?? null;

    const isManager = role === "MANAGER" || role === "BOTH";
    const isConsultant = role === "CONSULTANT" || role === "BOTH";


    return {
        role,
        isManager,
        isConsultant,
        canOpenAdminPage: isManager,
        canOpenSchedule: isManager,
    };
}
