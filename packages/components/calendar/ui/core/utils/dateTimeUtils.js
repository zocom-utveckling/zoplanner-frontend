// Delade datum-/tids-hjälpare. Tidigare fanns kopior av dessa i
// schedulerData.js, useSchedulerEvents.js och DashboardScheduler.jsx — bor
// nu bara här.

// Date / ISO / "YYYY-MM-DD HH:mm" → lokal Date, eller null om värdet är trasigt.
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

// Bygger en Date på angivet datum + specifikt klockslag.
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

// Returnerar "YYYY-MM-DD".
export function toDatePart(value) {
  const date = toLocalDateTime(value);
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Returnerar "HH:mm".
export function toTimePart(value) {
  const date = toLocalDateTime(value);
  if (!date) return null;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Slår ihop en aktivitets date ("YYYY-MM-DD") + startTime/endTime
// ("HH:mm" eller "HH:mm:ss") till en Date. Null om något saknas.
export function toActivityDateTime(dateValue, timeValue) {
  const date =
    typeof dateValue === "string" && dateValue.trim() ? dateValue.trim() : null;
  const rawTime =
    typeof timeValue === "string" && timeValue.trim() ? timeValue.trim() : null;
  if (!date || !rawTime) return null;

  const normalizedTime = rawTime.split(".")[0];
  const withSeconds = /^\d{2}:\d{2}$/.test(normalizedTime)
    ? `${normalizedTime}:00`
    : normalizedTime;

  return toLocalDateTime(`${date} ${withSeconds}`);
}
