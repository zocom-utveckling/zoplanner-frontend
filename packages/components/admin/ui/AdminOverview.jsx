export function AdminOverview({ ongoingItems, upcomingItems }) {
  //  mockdata
  const mockOngoing = [
    { id: "1", title: "Frontendutbildning – Granskning av kodprojekt" },
    { id: "2", title: "Förbereda lektion" },
    { id: "3", title: "Möte med kursledare" },
    { id: "4", title: "Sätta betyg på inlämning" },
  ];

  const mockUpcoming = [
    {
      id: "1",
      title: "Granskning av kodprojekt",
      dateLabel: "26 apr",
    },
    {
      id: "2",
      title: "Förbereda lektion",
      dateLabel: "27 apr",
    },
    {
      id: "3",
      title: "Möte med kursledare",
      dateLabel: "28 apr",
    },
  ];

  // använd props om de finns, annars mock
  const ongoing = ongoingItems?.length ? ongoingItems : mockOngoing;
  const upcoming = upcomingItems?.length ? upcomingItems : mockUpcoming;

  return (
    <div>
      <h1>Översikt</h1>

      <div className="overview-grid">
        <div className="overview-card">
          <h2>Pågående</h2>

          <ul>
            {ongoing.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>

        <div className="overview-card">
          <h2>Kommande uppgifter</h2>

          <ul>
            {upcoming.map((item) => (
              <li key={item.id}>
                {item.dateLabel ? `${item.dateLabel} – ` : ""}
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
