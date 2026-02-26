function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function toDateWithTime(dateValue, hours, minutes) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) {
    const baseDate = new Date(dateValue);
    if (Number.isNaN(baseDate.getTime())) return null;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  if (
    typeof dateValue === "object" &&
    dateValue !== null &&
    "year" in dateValue &&
    "month" in dateValue &&
    "day" in dateValue
  ) {
    const baseDate = new Date(
      dateValue.year,
      Math.max(0, dateValue.month - 1),
      dateValue.day,
    );
    if (Number.isNaN(baseDate.getTime())) return null;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  const asString = String(dateValue);
  if (/^\d{4}-\d{2}-\d{2}$/.test(asString)) {
    const [year, month, day] = asString.split("-").map(Number);
    const baseDate = new Date(year, Math.max(0, month - 1), day);
    if (Number.isNaN(baseDate.getTime())) return null;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  const base = asString.includes("T")
    ? new Date(asString)
    : new Date(`${asString}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  base.setHours(hours, minutes, 0, 0);
  return base;
}

export function toLocalDateTime(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : new Date(dateValue);
  }

  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();
    const match = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
    );

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const hour = Number(match[4]);
      const minute = Number(match[5]);
      const second = match[6] ? Number(match[6]) : 0;
      const localDate = new Date(year, month - 1, day, hour, minute, second, 0);
      return Number.isNaN(localDate.getTime()) ? null : localDate;
    }
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function fetchSchedulerEvents(user) {
  if (!user?.id) {
    return [];
  }

  let consultantId = user?.consultantId || user?.consultant?.id;

  if (!consultantId) {
    const consultantsRes = await fetch(`http://localhost:5027/api/Consultant`);
    const consultants = consultantsRes.ok ? await consultantsRes.json() : [];
    const match = consultants.find(
      (consultant) => consultant?.userId === user?.id,
    );
    consultantId = match?.id;
  }

  if (!consultantId) {
    return [];
  }

  const assignmentsRes = await fetch(
    `http://localhost:5027/api/Assignment/consultant/${consultantId}`,
  );

  const assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];

  const coursesRes = await fetch(`http://localhost:5027/api/Course`);
  const courses = coursesRes.ok ? await coursesRes.json() : [];
  const courseMap = new Map(
    (Array.isArray(courses) ? courses : [])
      .map((course) => [
        course?.id,
        firstNonEmptyString(
          course?.name,
          course?.Name,
          course?.courseName,
          course?.title,
        ),
      ])
      .filter(([id, name]) => Boolean(id) && Boolean(name)),
  );

  const nextEvents = [];

  assignments.forEach((assignment) => {
    const assignmentCourseId =
      assignment?.course?.id || assignment?.courseId || assignment?.idCourse;
    const courseName =
      (assignmentCourseId ? courseMap.get(assignmentCourseId) : null) ||
      "Uppdrag";
    const sessions = assignment?.sessions || [];

    if (Array.isArray(sessions) && sessions.length > 0) {
      sessions.forEach((session) => {
        const start = toLocalDateTime(
          session?.timeStart || session?.start || session?.time_start,
        );
        const end = toLocalDateTime(
          session?.timeEnd || session?.end || session?.time_end,
        );

        if (!start || !end) return;

        nextEvents.push({
          id: `session-${assignment.id}-${session.id}`,
          title: courseName,
          subtitle: firstNonEmptyString(
            session?.comment,
            session?.Comment,
            session?.sessionComment,
            session?.description,
          ),
          start,
          end,
          type: "session",
        });
      });
    }

    const start =
      toDateWithTime(assignment?.course?.dateStart, 8, 0) ||
      toDateWithTime(assignment?.dateStart, 8, 0) ||
      toDateWithTime(assignment?.startDate, 8, 0);
    const end =
      toDateWithTime(assignment?.course?.dateEnd, 17, 0) ||
      toDateWithTime(assignment?.dateEnd, 17, 0) ||
      toDateWithTime(assignment?.dateStart, 17, 0);

    if (!start || !end) return;

    nextEvents.push({
      id: `assignment-${assignment.id}`,
      title: courseName,
      start,
      end,
      type: "assignment",
    });
  });

  return nextEvents;
}
