
export function generateSessionsDraft({
    courseName,
    startDate,
    durationWeeks,
    totalHours,
    selectedWeekdays,
}){
const parsedDurationWeeks = Number(durationWeeks);
const parsedTotalHours = Number(totalHours);


if (
    !startDate || 
    Number.isNaN(parsedDurationWeeks) ||
    Number.isNaN(parsedTotalHours) ||
    parsedDurationWeeks < 1 ||
    parsedTotalHours < 1 ||
    !selectedWeekdays?.length
)
{
    return [];
}

const sessionCount = selectedWeekdays.length * parsedDurationWeeks;

  if (sessionCount < 1) {
    return [];
  }

const sessions = [];
const [year, month, day] = startDate.split("-").map(Number);
const baseDate = new Date(year, month - 1, day);
const hoursPerSession = parsedTotalHours / sessionCount;

const totalDays = parsedDurationWeeks * 7;

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
        const sessionDate = new Date(baseDate);
        sessionDate.setDate(baseDate.getDate() + dayOffset);
        
         const weekdayName = getWeekdayName(sessionDate);

    if (!selectedWeekdays.includes(weekdayName)) {
      continue;
    }

        const timeStart = new Date(sessionDate);
        timeStart.setHours(9, 0, 0, 0);

        const timeEnd = new Date(timeStart);
        timeEnd.setMinutes(timeEnd.getMinutes() + hoursPerSession * 60);
        
        const dateString = formatDate(sessionDate);
        const startDateTime = formatDateTime(timeStart);
        const endDateTime = formatDateTime(timeEnd);

        sessions.push({
            title: buildSessionTitle(courseName, sessions.length),
            dateStart: dateString,
            dateEnd: dateString,
            timeStart: startDateTime,
            timeEnd: endDateTime,
            hours: roundToTwoDecimals(hoursPerSession),
            location: "ONSITE",
        });
    }
    return sessions;
}

function buildSessionTitle(courseName, index) {
  const safeCourseName = courseName?.trim() || "Kurs";
  return `${safeCourseName} - Pass ${index + 1}`;
}


function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}


function getWeekdayName(date) {
  const day = date.getDay();

  switch (day) {
    case 1:
      return "MONDAY";
    case 2:
      return "TUESDAY";
    case 3:
      return "WEDNESDAY";
    case 4:
      return "THURSDAY";
    case 5:
      return "FRIDAY";
    case 6:
      return "SATURDAY";
    case 0:
      return "SUNDAY";
    default:
      return "";
  }
}
