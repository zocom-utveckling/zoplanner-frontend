export function toDateTime(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toActivityDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;

  const normalizedTime =
    String(timeValue).length === 5 ? `${timeValue}:00` : String(timeValue);
  return toDateTime(`${dateValue}T${normalizedTime}`);
}