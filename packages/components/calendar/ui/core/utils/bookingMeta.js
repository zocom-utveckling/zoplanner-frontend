// Plockar ut boknings-metadata ur ett kalender-event. Events kan ha id
// direkt eller komma som "session-{assignmentId}-{sessionId}" /
// "assignment-{id}". Komponenter ska använda dessa istället för att parsa
// id-strängar själva.

// Tar fram sessionId/assignmentId om eventet är en bokad session, annars null.
export function resolveSessionMeta(eventItem) {
  const directSessionId = eventItem?.sessionId;
  const directAssignmentId = eventItem?.assignmentId;

  if (directSessionId != null) {
    return {
      assignmentId: directAssignmentId ?? null,
      sessionId: directSessionId,
    };
  }

  const match = String(eventItem?.id || "").match(/^session-(.*?)-(.*)$/);
  if (!match) return null;
  return {
    assignmentId: match[1] || null,
    sessionId: match[2] || null,
  };
}

// Tar fram assignmentId om eventet är ett (obokat) uppdrag, annars null.
export function resolveAssignmentMeta(eventItem) {
  const directAssignmentId = eventItem?.assignmentId;
  if (directAssignmentId != null) {
    return { assignmentId: directAssignmentId };
  }

  const match = String(eventItem?.id || "").match(/^assignment-(.*)$/);
  if (!match) return null;
  return { assignmentId: match[1] || null };
}

// Tar bort " - {label}"-suffix från en titel. Används i korskalender-flödet på
// Dashboard där samma aktivitet finns på två användare med olika namn-suffix.
export function stripLabelSuffix(title, labels = []) {
  let baseTitle = String(title || "Aktivitet").trim();

  labels.filter(Boolean).forEach((label) => {
    const suffix = ` - ${label}`;
    if (baseTitle.endsWith(suffix)) {
      baseTitle = baseTitle.slice(0, -suffix.length).trim();
    }
  });

  return baseTitle || "Aktivitet";
}
