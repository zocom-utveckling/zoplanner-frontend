import { toLocalDateTime } from "./schedulerData";

const STORAGE_KEY_PREFIX = "zoplanner:calendar:local-activities:user:";
const LOCAL_ACTIVITY_EVENT = "zoplanner:local-activities:updated";

function toUserId(userOrId) {
  if (!userOrId) return null;
  if (typeof userOrId === "object") return userOrId.id ?? null;
  return userOrId;
}

function getStorageKey(userOrId) {
  const userId = toUserId(userOrId);
  return userId ? `${STORAGE_KEY_PREFIX}${userId}` : null;
}

function emitLocalActivityChange(userOrId) {
  const userId = toUserId(userOrId);
  if (!userId || typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(LOCAL_ACTIVITY_EVENT, {
      detail: { userId },
    }),
  );
}

function serializeForStorage(eventItem) {
  if (!eventItem?.id || !eventItem?.start || !eventItem?.end) return null;

  const start = toLocalDateTime(eventItem.start);
  const end = toLocalDateTime(eventItem.end);
  if (!start || !end) return null;

  return {
    id: eventItem.id,
    title: eventItem.title || "Aktivitet",
    subtitle: eventItem.subtitle || "",
    description: eventItem.description || eventItem.subtitle || "",
    start: start.toISOString(),
    end: end.toISOString(),
    type: eventItem.type || "meeting",
    source: "local",
    context: eventItem.context || null,
  };
}

function deserializeFromStorage(storedItem) {
  if (!storedItem?.id || !storedItem?.start || !storedItem?.end) return null;

  const start = toLocalDateTime(storedItem.start);
  const end = toLocalDateTime(storedItem.end);
  if (!start || !end) return null;

  return {
    id: storedItem.id,
    title: storedItem.title || "Aktivitet",
    subtitle: storedItem.subtitle || "",
    description: storedItem.description || storedItem.subtitle || "",
    start,
    end,
    type: storedItem.type || "meeting",
    source: "local",
    context: storedItem.context || undefined,
  };
}

function readRawLocalActivities(userOrId) {
  const key = getStorageKey(userOrId);
  if (!key || typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRawLocalActivities(userOrId, rawEvents) {
  const key = getStorageKey(userOrId);
  if (!key || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(rawEvents));
    emitLocalActivityChange(userOrId);
  } catch {
    // no-op
  }
}

export function listLocalActivities(userOrId) {
  return readRawLocalActivities(userOrId)
    .map(deserializeFromStorage)
    .filter(Boolean);
}

export function saveLocalActivity(userOrId, eventItem) {
  const serialized = serializeForStorage(eventItem);
  if (!serialized) return null;

  const existing = readRawLocalActivities(userOrId);
  const updated = [
    ...existing.filter((item) => item?.id !== serialized.id),
    serialized,
  ];
  writeRawLocalActivities(userOrId, updated);

  return deserializeFromStorage(serialized);
}

export function removeLocalActivity(userOrId, eventId) {
  if (!eventId) return;

  const existing = readRawLocalActivities(userOrId);
  const updated = existing.filter((item) => item?.id !== eventId);

  if (updated.length !== existing.length) {
    writeRawLocalActivities(userOrId, updated);
  }
}

export function createLocalActivityFromForm(user, formData) {
  if (
    !user?.id ||
    !formData?.date ||
    !formData?.startTime ||
    !formData?.endTime
  ) {
    return null;
  }

  const start = toLocalDateTime(`${formData.date} ${formData.startTime}:00`);
  const end = toLocalDateTime(`${formData.date} ${formData.endTime}:00`);

  if (!start || !end || end <= start) {
    return null;
  }

  return {
    id: `local-${user.id}-${Date.now()}`,
    title: formData.title || "Aktivitet",
    subtitle: formData.description || "",
    description: formData.description || "",
    start,
    end,
    type: formData.type || "meeting",
    source: "local",
    context: {
      consultant: user?.name || user?.username,
    },
  };
}

export function subscribeToLocalActivityChanges(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleCustomEvent(event) {
    callback?.(event?.detail?.userId ?? null);
  }

  function handleStorageEvent(event) {
    if (!event?.key?.startsWith(STORAGE_KEY_PREFIX)) return;
    const userId = event.key.slice(STORAGE_KEY_PREFIX.length);
    callback?.(userId || null);
  }

  window.addEventListener(LOCAL_ACTIVITY_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(LOCAL_ACTIVITY_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
