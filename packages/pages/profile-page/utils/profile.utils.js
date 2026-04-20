function formatDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(startValue, endValue) {
  const start = formatDate(startValue);
  const end = formatDate(endValue || startValue);

  if (!start && !end) return "Datum saknas";
  if (!end || start === end) return start;
  return `${start} - ${end}`;
}

function formatActivityTime(activity) {
  const dateLabel = formatDate(activity?.date);
  const startTime = activity?.startTime || activity?.timeStart || "";
  const endTime = activity?.endTime || activity?.timeEnd || "";

  if (dateLabel && startTime && endTime) {
    return `${dateLabel} kl. ${startTime}-${endTime}`;
  }

  if (dateLabel) return dateLabel;
  return "Tid saknas";
}

const COMPETENCIES_STORAGE_KEY_PREFIX = "zoplanner.profileCompetencies";

function normalizeCompetencies(values) {
  if (!Array.isArray(values)) return [];

  return Array.from(
    new Set(values.map((value) => String(value || "").trim()).filter(Boolean)),
  );
}

function getCompetenciesStorageKey(userId) {
  if (!userId) return null;
  return `${COMPETENCIES_STORAGE_KEY_PREFIX}.${userId}`;
}

function getStoredCompetencies(userId) {
  const storageKey = getCompetenciesStorageKey(userId);

  if (!storageKey || typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return normalizeCompetencies(parsed);
  } catch (_error) {
    return [];
  }
}

function saveStoredCompetencies(userId, competencies) {
  const storageKey = getCompetenciesStorageKey(userId);

  if (!storageKey || typeof window === "undefined") return;

  const normalized = normalizeCompetencies(competencies);

  try {
    if (!normalized.length) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(normalized));
  } catch (_error) {
    // localStorage can fail in private mode or if storage quota is exceeded.
  }
}

function normalizeSkills(user) {
  const skills = [];

  const storedSkills = getStoredCompetencies(user?.id);
  if (storedSkills.length) {
    return storedSkills;
  }

  if (Array.isArray(user?.competencies)) {
    skills.push(
      ...user.competencies
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    );
  }

  if (Array.isArray(user?.skills)) {
    skills.push(
      ...user.skills.map((value) => String(value || "").trim()).filter(Boolean),
    );
  }

  return normalizeCompetencies(skills);
}

function createEditDraft(user) {
  return {
    email: user?.email || "",
    username: user?.username || "",
    city: user?.city || "",
  };
}

export {
  formatDate,
  formatDateRange,
  formatActivityTime,
  getStoredCompetencies,
  saveStoredCompetencies,
  normalizeSkills,
  createEditDraft,
};
