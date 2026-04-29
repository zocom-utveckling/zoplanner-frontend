import { classService, courseService, assignmentService } from "@zoplanner/api";

export async function createPlanningOrder({
  customerId,
  customerName,
  className,
  courseName,
  startDate,
  endDate,
  totalHours,
  managerId, // 👈 viktigt
}) {
  if (!customerId || !className || !courseName) {
    throw new Error("Missing required data for planning order");
  }

  // ===== CREATE CLASS =====
  let createdClass;

  try {
    createdClass = await classService.create({
      name: className,
      customerId,
    });
    console.log("✅ Class created:", createdClass);
  } catch (error) {
    console.error("❌ Failed class payload:", {
      name: className,
      customerId,
    });
    console.error("❌ Failed class error:", error);
    console.error("❌ Failed class response:", error?.response);
    console.error("❌ Failed class response data:", error?.response?.data);
    throw error;
  }

  const classId = createdClass?.id ?? createdClass?.data?.id;

  if (!classId) {
    console.error("❌ Class created without id:", createdClass);
    throw new Error("Failed to create class");
  }

  // ===== CREATE COURSE =====
  let createdCourse;

  try {
    createdCourse = await courseService.create({
      classId,
      name: courseName,
      dateStart: startDate,
      dateEnd: endDate,
    });
    console.log("✅ Course created:", createdCourse);
  } catch (error) {
    console.error("❌ Failed course payload:", {
      classId,
      name: courseName,
      dateStart: startDate,
      dateEnd: endDate,
    });
    console.error("❌ Failed course error:", error);
    console.error("❌ Failed course response:", error?.response);
    console.error("❌ Failed course response data:", error?.response?.data);
    throw error;
  }

  const courseId = createdCourse?.id ?? createdCourse?.data?.id;

  if (!courseId) {
    console.error("❌ Course created without id:", createdCourse);
    throw new Error("Failed to create course");
  }

  // ===== CREATE ASSIGNMENT (DET SOM SAKNADES) =====
  let createdAssignment;

  try {
    createdAssignment = await assignmentService.create({
      managerId,
      consultantId: null,
      courseId,
      dateStart: startDate,
      dateEnd: endDate,
      published: false,
    });

    console.log("✅ Assignment created:", createdAssignment);
  } catch (error) {
    console.error("❌ Failed assignment payload:", {
      managerId,
      consultantId: null,
      courseId,
      dateStart: startDate,
      dateEnd: endDate,
      published: false,
    });
    console.error("❌ Failed assignment error:", error);
    console.error("❌ Failed assignment response:", error?.response);
    console.error("❌ Failed assignment response data:", error?.response?.data);
    throw error;
  }

  const assignmentId =
    createdAssignment?.id ?? createdAssignment?.data?.id;

  if (!assignmentId) {
    console.error("❌ Assignment created without id:", createdAssignment);
    throw new Error("Failed to create assignment");
  }

  // ===== RETURN REAL DATA =====
  return {
    id: assignmentId,
    assignmentId,
    customerId,
    customerName,
    classId,
    className,
    courseId,
    courseName,
    startDate,
    endDate,
    totalHours,
    status: "draft",
  };
}