// Hjälpare som plockar ut fält från API-svar. Backend skickar samma data
// under olika namn beroende på endpoint (`name` vs `Name`, `consultantId` vs
// `idConsultant` osv) — använd dessa istället för nya "value || alt1 || alt2"-
// kedjor i komponentkod.

// Första icke-tomma trim:ade strängen, annars null.
export function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

// Första värdet som inte är null/undefined/tom sträng.
export function firstNonNull(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }
  return null;
}

// Plockar ut en array oavsett om datan är `array` eller `{ data: array }`.
export function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

// Tar ut ett person-namn från de olika fält backend kan skicka.
export function getPersonName(person) {
  return firstNonEmptyString(
    person?.name,
    person?.Name,
    person?.fullName,
    person?.FullName,
    [person?.firstName, person?.lastName].filter(Boolean).join(" "),
    [person?.FirstName, person?.LastName].filter(Boolean).join(" "),
  );
}

// Plockar konsult-id från ett uppdrag (oavsett fältvariant i backend-svaret).
export function getAssignmentConsultantId(assignment) {
  return (
    assignment?.consultantId ||
    assignment?.idConsultant ||
    assignment?.consultant?.id ||
    null
  );
}

// Visningsnamn för ett uppdrags konsult. Faller tillbaka till consultantNameById-
// Mappen om uppdraget självt saknar fältet.
export function getAssignmentConsultantName(assignment, consultantNameById) {
  const consultantId = getAssignmentConsultantId(assignment);

  return firstNonEmptyString(
    getPersonName(assignment?.consultant),
    assignment?.consultantName,
    assignment?.consultant?.name,
    assignment?.consultant?.Name,
    consultantId ? consultantNameById.get(consultantId) : null,
  );
}

// True om användarens roll innehåller "consultant" eller "both".
export function hasConsultantRole(user) {
  const roleValue = firstNonEmptyString(user?.role, user?.Role);
  if (!roleValue) return false;

  const normalizedRoles = roleValue
    .toLowerCase()
    .split(/[\s,;|/+-]+/)
    .map((role) => role.trim())
    .filter(Boolean);

  return (
    normalizedRoles.includes("consultant") || normalizedRoles.includes("both")
  );
}

// Normaliserar plats-typ till "REMOTE" | "ONSITE" | "HYBRID" eller null.
export function normalizeLocationType(locationTypeValue) {
  const normalized = firstNonEmptyString(locationTypeValue)?.toUpperCase();
  if (normalized === "REMOTE") return "REMOTE";
  if (normalized === "ONSITE") return "ONSITE";
  if (normalized === "HYBRID") return "HYBRID";
  return null;
}

// Title-case:ar en stadsbenämning ("STOCKHOLM"/"stockholm" → "Stockholm").
export function toDisplayCity(cityValue) {
  const normalized = firstNonEmptyString(cityValue);
  if (!normalized) return null;
  return normalized
    .toLocaleLowerCase("sv")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("sv") + part.slice(1))
    .join(" ");
}

// Plockar uppdragets id (varianter: id, assignmentId, idAssignment, …).
export function resolveAssignmentId(assignment) {
  return firstNonNull(
    assignment?.id,
    assignment?.assignmentId,
    assignment?.idAssignment,
    assignment?.AssignmentId,
    assignment?.Id,
  );
}

// Plockar sessionens id (varianter: id, sessionId, idSession, …).
export function resolveSessionId(session) {
  return firstNonNull(
    session?.id,
    session?.sessionId,
    session?.idSession,
    session?.SessionId,
    session?.Id,
  );
}
