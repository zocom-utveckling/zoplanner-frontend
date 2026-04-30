import { generateSessionsDraft } from "./generateSessionsDraft";

export function buildCourseDraft({
  courseName,
  isDraftCourse = false,
  classId = null,
  className = "",
  isDraftClass = false,
  customerId = null,
  customerName = "",
  isDraftCustomer = false,
  startDate,
  endDate,
  totalHours,
  selectedWeekdays,
}) {
  const safeCourseName = courseName?.trim() || "";
  const parsedTotalHours = Number(totalHours);
  const now = new Date().toISOString();

  const sessionsDraft = generateSessionsDraft({
    courseName: safeCourseName,
    startDate,
    endDate,
    totalHours,
    selectedWeekdays,
  });

  const sessionCount = sessionsDraft.length;
  const hoursPerSession =
    sessionCount > 0 ? parsedTotalHours / sessionCount : 0;

  return {
    id: crypto.randomUUID(),
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,

    // 🔥 CORE
    courseName: safeCourseName,
    isDraftCourse,
    classId,
    className,
    isDraftClass,
    customerId,
    customerName,
    isDraftCustomer,

    startDate,
    endDate,
    totalHours: parsedTotalHours,
    selectedWeekdays,

    sessionCount,
    hoursPerSession,
    sessionsDraft,

    consultantId: null,
  };
}

export function toDraftCourseRow(draft) {
  return {
    id: `draft-${draft.id}`,
    draftId: draft.id,
    isDraft: true,
    assignment: draft,

    name: draft.courseName || "Utkast",
    customer: draft.customerName || "Ej vald",

    startDate: draft.startDate,
    endDate: draft.endDate,

    sessions: draft.sessionsDraft ?? [],

    managerId: null,
    subject: draft.subject || draft.subjectArea || draft.courseSubject || "",
    status: "draft",
  };
}