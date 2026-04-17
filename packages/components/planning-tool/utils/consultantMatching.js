export function toBusySlots({ activities = [], sessions = [] }) {
  const activitySlots = activities.map((activity) => ({
    timeStart: activity.timeStart,
    timeEnd: activity.timeEnd,
    source: "activity",
    original: activity,
  }));

  const sessionSlots = sessions.map((session) => ({
    timeStart: session.timeStart,
    timeEnd: session.timeEnd,
    source: "session",
    original: session,
  }));

  return [...activitySlots, ...sessionSlots];
}

export function countConflicts(courseSessions = [], busySlots = []) {
  return courseSessions.reduce((count, courseSession) => {
    if (!courseSession?.timeStart || !courseSession?.timeEnd) return count;

    const hasConflict = busySlots.some((slot) => {
      if (!slot?.timeStart || !slot?.timeEnd) return false;

      return rangesOverlap(
        courseSession.timeStart,
        courseSession.timeEnd,
        slot.timeStart,
        slot.timeEnd,
      );
    });

    return hasConflict ? count + 1 : count;
  }, 0);
}

function rangesOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd && bStart < aEnd;
}