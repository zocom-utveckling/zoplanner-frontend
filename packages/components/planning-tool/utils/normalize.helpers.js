export function cleanDraftLabel(value, fallback = "-") {
  const text = String(value ?? "").trim();

  if (!text) return fallback;

  return text.replace(/^UTKAST\s*[–-]\s*/i, "");
}

export function getCourseName(obj, fallback = "Kurs") {
  return cleanDraftLabel(
    obj?.course?.name || obj?.courseName || obj?.name,
    fallback,
  );
}

export function getCustomerName(obj, fallback = "Ange kund") {
  return cleanDraftLabel(
    obj?.customer?.name ||
      obj?.customerName ||
      obj?.client?.name ||
      obj?.course?.customerName ||
      obj?.course?.customer?.name,
    fallback,
  );
}

export function getClassName(obj, fallback = "Ange klass") {
  return cleanDraftLabel(
    obj?.class?.name ||
      obj?.className ||
      obj?.schoolClass?.name ||
      obj?.course?.className,
    fallback,
  );
}

export function getConsultantName(obj, fallback = "Ingen konsult") {
  return (
    obj?.consultant?.name ||
    obj?.consultantName ||
    obj?.user?.name ||
    fallback
  );
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