import { generateSessionsDraft } from "./generateSessionsDraft";

export function buildCourseDraft({
courseName,
classId = null,
startDate,
durationWeeks,
totalHours,
selectedWeekdays,
}){
const parsedDurationWeeks = Number(durationWeeks);
const parsedTotalHours = Number(totalHours);
const sessionCount = selectedWeekdays.length * parsedDurationWeeks;

const hoursPerSession = 
 sessionCount > 0 ? parsedTotalHours / sessionCount : 0;

 return {
    courseName: courseName?.trim() || "",
    classId,
    startDate,
    durationWeeks: parsedDurationWeeks,
    totalHours: parsedTotalHours,
    selectedWeekdays,
   sessionCount,
   hoursPerSession,
   sessionsDraft: generateSessionsDraft({
      courseName,
      startDate,
      durationWeeks,
      totalHours,
      selectedWeekdays,
    }),
    consultantId: null,
}
}