
export function generateSessionsDraft({
    courseName,
    startDate,
    endDate,
    totalHours,
    selectedWeekdays,
}){
const parsedTotalHours = Number(totalHours);


if (
    !startDate || 
    !endDate ||
    Number.isNaN(parsedTotalHours) ||
    parsedTotalHours < 1 ||
    !selectedWeekdays?.length
){
    return [];
}

 const hasMissingTime = selectedWeekdays.some((item) => !item.startTime);

  if (hasMissingTime) {
    return [];
  }

const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

const baseDate = new Date(startYear, startMonth - 1, startDay);
const finalDate = new Date(endYear, endMonth - 1, endDay);

if (finalDate < baseDate) {
  return [];
}

const totalDays = 
Math.floor((finalDate - baseDate) / (1000 * 60 * 60 * 24)) + 1;

const matchingDates = [];

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
        const sessionDate = new Date(baseDate);
        sessionDate.setDate(baseDate.getDate() + dayOffset);
        
         const weekdayName = getWeekdayName(sessionDate);

         const weekdayConfig = selectedWeekdays.find(
          (item) => item.day === weekdayName
         );

         if (weekdayConfig) {
          matchingDates.push({
            date: new Date(sessionDate),
            startTime: weekdayConfig.startTime,
          });
         }
    }
 const sessionCount = matchingDates.length;
if (sessionCount < 1) {
  return [];
}
  

const hoursPerSession = parsedTotalHours / sessionCount;


return matchingDates.map(({ date, startTime }, index) => {
  const [hours, minutes] = startTime.split(":").map(Number);

 const timeStart = new Date(date);
        timeStart.setHours(hours, minutes, 0, 0);

 const timeEnd = new Date(timeStart);
        timeEnd.setMinutes(timeEnd.getMinutes() + hoursPerSession * 60); 

 const dateString = formatDate(date);
 const startDateTime = formatDateTime(timeStart);
 const endDateTime = formatDateTime(timeEnd);

 return {
            title: buildSessionTitle(courseName, index),
            dateStart: dateString,
            dateEnd: dateString,
            timeStart: startDateTime,
            timeEnd: endDateTime,
            hours: roundToTwoDecimals(hoursPerSession),
            location: "ONSITE",
        };
        });
        
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
