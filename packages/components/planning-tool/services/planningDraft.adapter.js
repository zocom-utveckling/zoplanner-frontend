export function toPlanningDraft(courseDraft) {
    return {
        courseName: courseDraft.courseName,
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