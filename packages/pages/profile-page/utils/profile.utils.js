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

function normalizeSkills(user) {
  const skills = [];

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

  if (!skills.length && user?.role) skills.push(String(user.role));

  return skills;
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
  normalizeSkills,
  createEditDraft,
};
