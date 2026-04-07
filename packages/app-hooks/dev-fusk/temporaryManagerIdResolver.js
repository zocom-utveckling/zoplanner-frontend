// ⚠️ TEMP DEV-ONLY RESOLVER
// Resolves managerId from backend using logged-in userId.
// Remove when real auth/login provides correct managerId.

export async function resolveTemporaryManagerId(userId) {
  if (!userId) return null;

  try {
    const res = await fetch("http://localhost:5027/api/Manager");
    const managers = await res.json();

    if (!res.ok || !Array.isArray(managers)) {
      return null;
    }

    const manager = managers.find((m) => m.userId === userId);

    return manager ? Number(manager.id) : null;
  } catch (error) {
    console.warn("Temporary managerId resolver failed", error);
    return null;
  }
}