import { generateSessionsDraft } from "./generateSessionsDraft";

export function buildCourseDraft({
courseName,
classId = null,
startDate,
endDate,
totalHours,
selectedWeekdays,
}){



const safeCourseName = courseName?.trim() || "";
const parsedTotalHours = Number(totalHours);
const now = new Date().toISOString();

const sessionsDraft = generateSessionsDraft({
  courseName: safeCourseName,
  startDate,
  endDate,
  totalHours,
  selectedWeekdays,
})

const sessionCount = sessionsDraft.length;
const hoursPerSession = 
 sessionCount > 0 ? parsedTotalHours / sessionCount : 0;

 return {
   id: crypto.randomUUID(),
   status: "DRAFT",
   createdAt: now,
   updatedAt: now,
    courseName: safeCourseName,
    classId,
    startDate,
    endDate,
    totalHours: parsedTotalHours,
    selectedWeekdays,
   sessionCount,
   hoursPerSession,
   sessionsDraft,
    consultantId: null,
}


}