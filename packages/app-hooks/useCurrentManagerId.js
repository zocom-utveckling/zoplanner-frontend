export function useCurrentManagerId() {
  const managerId = localStorage.getItem("managerId");

  return managerId ? Number(managerId) : null;
}