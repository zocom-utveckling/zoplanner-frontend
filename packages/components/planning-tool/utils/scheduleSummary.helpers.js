export function buildScheduleSummary(sessions = []) {
  if (!sessions.length) return "Saknas";

  const dayLabels = {
    1: "Måndagar",
    2: "Tisdagar",
    3: "Onsdagar",
    4: "Torsdagar",
    5: "Fredagar",
    6: "Lördagar",
    0: "Söndagar",
  };

  const grouped = {};

  sessions.forEach((session) => {
    if (!session?.timeStart || !session?.timeEnd) return;

    const startDate = new Date(session.timeStart);
    const dayKey = startDate.getDay();
    const start = session.timeStart.split("T")[1]?.slice(0, 5);
    const end = session.timeEnd.split("T")[1]?.slice(0, 5);

    if (!grouped[dayKey]) {
      grouped[dayKey] = `${start}–${end}`;
    }
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([dayKey, timeRange]) => `${dayLabels[dayKey]} ${timeRange}`)
    .join(", ");
}