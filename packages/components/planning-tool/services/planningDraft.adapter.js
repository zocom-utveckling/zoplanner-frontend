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
    classId: draft.classId ?? null,
    dateStart: draft.startDate,
    dateEnd: draft.endDate,
    status: "DRAFT",
  };
}
export function toSessionPayloads(draft) {
  if (!draft?.sessionsDraft?.length) return [];

  return draft.sessionsDraft.map((session) => ({
    timeStart: `${session.timeStart}:00`,
    timeEnd: `${session.timeEnd}:00`,
    location: session.location,
    comment: session.title,
  }));
}