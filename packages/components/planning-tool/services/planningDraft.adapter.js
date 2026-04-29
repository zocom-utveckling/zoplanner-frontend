import {
  getClassName,
  getCourseName,
  getCustomerName,
  getEndDate,
  getSessionTitle,
  getStartDate,
} from "../utils/normalize.helpers";

export function toPlanningDraft(courseDraft) {
  return {
    id: courseDraft.id,
    assignmentId: courseDraft.assignmentId ?? null,
    status: courseDraft.status,
    createdAt: courseDraft.createdAt,
    updatedAt: courseDraft.updatedAt,

    courseId: courseDraft.courseId ?? null,
    courseName: courseDraft.courseName ?? "UTKAST – ange kursnamn",
    isDraftCourse:
      courseDraft.isDraftCourse ??
      (!courseDraft.courseName ||
        String(courseDraft.courseName).startsWith("UTKAST")),

    customerId: courseDraft.customerId ?? null,
    customerName: courseDraft.customerName ?? "UTKAST – ange kund",
    isDraftCustomer:
      courseDraft.isDraftCustomer ??
      (!courseDraft.customerName ||
        String(courseDraft.customerName).startsWith("UTKAST")),

    classId: courseDraft.classId ?? null,
    className: courseDraft.className ?? "UTKAST – ange klass",
    isDraftClass:
      courseDraft.isDraftClass ??
      (!courseDraft.className ||
        String(courseDraft.className).startsWith("UTKAST")),

    startDate: courseDraft.startDate,
    endDate: courseDraft.endDate,
    totalHours: courseDraft.totalHours,
    selectedWeekdays: courseDraft.selectedWeekdays,
    sessionCount: courseDraft.sessionCount,
    hoursPerSession: courseDraft.hoursPerSession,
    sessionsDraft: courseDraft.sessionsDraft,
    consultantId: courseDraft.consultantId ?? null,
    existingSessionIds: courseDraft.existingSessionIds ?? [],
  };
}

function toDateOnlyString(value) {
  if (!value) return "";
  const raw = String(value);
  return raw.includes("T") ? raw.split("T")[0] : raw;
}

function inferTotalHoursFromSessions(sessions = []) {
  const totalMs = sessions.reduce((sum, session) => {
    const start = new Date(session?.timeStart);
    const end = new Date(session?.timeEnd);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return sum;
    }

    return sum + Math.max(0, end.getTime() - start.getTime());
  }, 0);

  return Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100;
}

function isDraftName(value, fallbackPrefix = "UTKAST") {
  return !value || String(value).startsWith(fallbackPrefix);
}

export function toPlanningDraftFromAssignment(assignment) {
  const assignmentId = assignment?.id ?? null;
  const sessions = Array.isArray(assignment?.sessions)
    ? assignment.sessions
    : [];

  const startDate = toDateOnlyString(getStartDate(assignment));
  const endDate = toDateOnlyString(getEndDate(assignment));

  const sessionsDraft = sessions
    .filter((session) => session?.timeStart && session?.timeEnd)
    .map((session, index) => {
      const sessionStartDate = toDateOnlyString(
        session?.timeStart || startDate,
      );
      const sessionEndDate = toDateOnlyString(
        session?.timeEnd || sessionStartDate,
      );

      const title = getSessionTitle(session, index);

      return {
        id: session?.id ?? `session-${index + 1}`,
        title,
        comment: title,
        dateStart: sessionStartDate,
        dateEnd: sessionEndDate,
        timeStart: session.timeStart,
        timeEnd: session.timeEnd,
        location: session?.location || "ONSITE",
      };
    });

  const courseName = getCourseName(
    assignment,
    "UTKAST – ange kursnamn",
  );
  const className = getClassName(
    assignment,
    "UTKAST – ange klass",
  );
  const customerName = getCustomerName(
    assignment,
    "UTKAST – ange kund",
  );

  const totalHours =
    assignment?.totalHours != null
      ? Number(assignment.totalHours)
      : inferTotalHoursFromSessions(sessionsDraft);

  return toPlanningDraft({
    id: assignmentId,
    assignmentId,
    status: assignment?.status || "DRAFT",
    createdAt: assignment?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    courseId: assignment?.courseId ?? assignment?.course?.id ?? null,
    courseName,
    isDraftCourse: isDraftName(courseName),

    customerId:
      assignment?.customerId ?? assignment?.customer?.id ?? null,
    customerName,
    isDraftCustomer: isDraftName(customerName),

    classId:
      assignment?.classId ??
      assignment?.class?.id ??
      assignment?.schoolClass?.id ??
      null,
    className,
    isDraftClass: isDraftName(className),

    startDate,
    endDate,
    totalHours,
    selectedWeekdays: [],
    sessionCount: sessionsDraft.length,
    hoursPerSession:
      sessionsDraft.length > 0
        ? totalHours / sessionsDraft.length
        : 0,
    sessionsDraft,
    consultantId: assignment?.consultantId ?? null,
    existingSessionIds: sessions
      .map((session) => session?.id)
      .filter((sessionId) => sessionId != null),
  });
}

export function fromPlanningDraft(savedDraft) {
  return savedDraft;
}

export function toAssignmentPayload(draft, managerId) {
  return {
    managerId,
    consultantId: draft.consultantId ?? null,
    courseId: draft.courseId ?? null,
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