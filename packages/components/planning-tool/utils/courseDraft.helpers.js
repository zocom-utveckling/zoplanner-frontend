export function buildCourseDraft({
courseName,
classId = null,
startDate,
durationWeeks,
totalHours,
sessionCount,
}){
const parsedDurationWeeks = Number(durationWeeks);
const parsedTotalHours = Number(totalHours);
const parsedSessionCount = Number(sessionCount);

const hoursPerSession = 
 parsedSessionCount > 0 ? parsedTotalHours / parsedSessionCount : 0;

 return {
    courseName: courseName.trim(),
    classId,
    startDate,
    durationWeeks: parsedDurationWeeks,
    totalHours: parsedTotalHours,
    sessionCount: parsedSessionCount,
    hoursPerSession,
    sessionDraft: [],
    sonsultantId: null,
 };
}