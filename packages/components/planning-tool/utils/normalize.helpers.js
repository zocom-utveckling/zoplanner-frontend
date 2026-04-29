export function getCourseName(obj, fallback = "Kurs") {
  return obj?.course?.name || obj?.courseName || obj?.name || fallback;
}

export function getCustomerName(obj, fallback = "-") {
  return obj?.customer?.name || obj?.customerName || obj?.client?.name || fallback;
}

export function getClassName(obj, fallback = "-") {
  return obj?.class?.name || obj?.className || obj?.schoolClass?.name || fallback;
}

export function getStartDate(obj) {
  return obj?.startDate || obj?.dateStart || "";
}

export function getEndDate(obj) {
  return obj?.endDate || obj?.dateEnd || "";
}

export function getSessionTitle(session, index) {
  return session?.title || session?.comment || `Pass ${index + 1}`;
}