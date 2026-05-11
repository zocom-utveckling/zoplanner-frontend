// Delad event-bus så andra kalendrar vet att de ska ladda om när en aktivitet
// skapats/uppdaterats/raderats. Anropa emitActivitiesUpdated(userId) — skriv
// aldrig egna dispatchEvent på detta namn.

export const ACTIVITIES_UPDATED_EVENT = "zoplanner:activities:updated";

export function emitActivitiesUpdated(userId) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ACTIVITIES_UPDATED_EVENT, {
      detail: { userId: userId ?? null },
    }),
  );
}
