export function toPlanningDraft(courseDraft) {
  return {
    id: courseDraft.id,
    status: courseDraft.status,
    createdAt: courseDraft.createdAt,
    updatedAt: courseDraft.updatedAt,
    courseName: courseDraft.courseName,
    classId: courseDraft.classId ?? null,
    startDate: courseDraft.startDate,
    endDate: courseDraft.endDate,
    totalHours: courseDraft.totalHours,
    selectedWeekdays: courseDraft.selectedWeekdays,
    sessionCount: courseDraft.sessionCount,
    hoursPerSession: courseDraft.hoursPerSession,
    sessionsDraft: courseDraft.sessionsDraft,
    consultantId: courseDraft.consultantId ?? null,
  };
}

export function fromPlanningDraft(savedDraft) {
    return savedDraft;
}

export function toAssignmentPayload(draft, managerId) {
  return {
    managerId,
    consultantId: draft.consultantId ?? null,
    dateStart: draft.startDate,
    dateEnd: draft.endDate,
    published: false,
  };
}

function normalizeDateTime(value) {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

export function toSessionPayloads(draft) {
  if (!draft?.sessionsDraft?.length) return [];

  return draft.sessionsDraft.map((session) => ({
    timeStart: normalizeDateTime(session.timeStart),
    timeEnd: normalizeDateTime(session.timeEnd),
    location: session.location,
    comment: session.title,
  }));
}