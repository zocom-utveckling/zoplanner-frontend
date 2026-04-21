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
