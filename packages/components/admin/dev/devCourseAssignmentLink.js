/**
 * ⚠️ DEV ONLY
 * Temporary mapping between assignment and course name.
 * Used until backend properly connects course ↔ assignment.
 * Remove when backend support is implemented.
 */

const STORAGE_KEY = "devCourseAssignmentLink";

function getMap() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function setMap(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function saveCourseNameForAssignment(assignmentId, courseName) {
  if (!assignmentId || !courseName) return;

  const map = getMap();
  map[String(assignmentId)] = courseName;
  setMap(map);
}

export function getCourseNameForAssignment(assignment) {
  const map = getMap();

  return (
    assignment?.course?.name ||
    map[String(assignment?.id)] ||
    `Kurs ${assignment?.dateStart ?? assignment?.id ?? ""}`
  );
}