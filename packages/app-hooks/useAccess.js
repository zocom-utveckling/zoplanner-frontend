export function useAccess(user) {
    const role = user?.role;

    const isManager = role === "MANAGER" || role === "BOTH";
    const isConsultant = role === "CONSULTANT" || role === "BOTH";

    return {
        isManager,
        isConsultant,
        canOpenAdminPage: isManager,
        canOpenSchedule: isManager,
    };
}
