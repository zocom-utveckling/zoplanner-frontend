export const DEFAULT_ACTIVITY_COLOR = "blue";

export const ACTIVITY_COLOR_OPTIONS = [
  { key: "blue", label: "Blå", accent: "#2f7de1" },
  { key: "green", label: "Grön", accent: "#2f9e44" },
  { key: "orange", label: "Orange", accent: "#f08c00" },
  { key: "purple", label: "Lila", accent: "#7c3aed" },
  { key: "pink", label: "Rosa", accent: "#d63384" },
];

const ACTIVITY_COLOR_MAP = {
  blue: {
    accent: "#2f7de1",
    background: "#d8e6f7",
  },
  green: {
    accent: "#2f9e44",
    background: "#d9f2e1",
  },
  orange: {
    accent: "#f08c00",
    background: "#fde8cc",
  },
  purple: {
    accent: "#7c3aed",
    background: "#e9ddff",
  },
  pink: {
    accent: "#d63384",
    background: "#f9d9e9",
  },
};

export function normalizeActivityColor(colorKey) {
  if (!colorKey) return DEFAULT_ACTIVITY_COLOR;
  const normalized = String(colorKey).toLowerCase();
  return ACTIVITY_COLOR_MAP[normalized] ? normalized : DEFAULT_ACTIVITY_COLOR;
}

export function getActivityColorTokens(colorKey) {
  return ACTIVITY_COLOR_MAP[normalizeActivityColor(colorKey)];
}

export function getDashboardEventColorVars(colorKey) {
  const tokens = getActivityColorTokens(colorKey);
  return {
    "--event-card-accent": tokens.accent,
    "--event-card-bg": tokens.background,
  };
}

export function getAllSchedulesEventColorVars(colorKey) {
  const tokens = getActivityColorTokens(colorKey);
  return {
    "--event-border": tokens.accent,
    "--event-bg": tokens.background,
  };
}

// Weekday colors (Mon=0 … Sun=6), matching the week-color palette in the UI
const WEEKDAY_COLOR_MAP = [
  { accent: "#5cb85c", background: "#d9f0d9" }, // Måndag – grön
  { accent: "#4faabd", background: "#cce8f3" }, // Tisdag – ljusblå
  { accent: "#aaaaaa", background: "#f5f5f5" }, // Onsdag – neutral
  { accent: "#c0924c", background: "#eddfc5" }, // Torsdag – brun/tan
  { accent: "#c0c020", background: "#f4f1b0" }, // Fredag – gul
  { accent: "#9070cc", background: "#e2d8f5" }, // Lördag – lavendel
  { accent: "#cc5060", background: "#f5d5d8" }, // Söndag – rosa
];

/**
 * Returns CSS variable object for a booking based on its day of week.
 * @param {Date|string} date - the event's start date
 */
export function getBookingWeekdayColorVars(date) {
  const d = date instanceof Date ? date : new Date(date);
  // JS getDay(): 0=Sunday … 6=Saturday → convert to Mon=0 … Sun=6
  const jsDay = d.getDay();
  const idx = jsDay === 0 ? 6 : jsDay - 1;
  const tokens = WEEKDAY_COLOR_MAP[idx];
  return {
    "--event-card-accent": tokens.accent,
    "--event-card-bg": tokens.background,
  };
}
