import "./index.css";

export function AdminOverview({
  planningItems = [],
  incompleteItems = [],
  isLoading = false,
  error = "",
  onIncompleteItemClick,
}) {
  const todayLabel = new Date()
    .toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/^./, (char) => char.toUpperCase());

  return (
    <div className="admin-overview">
      <h3>{todayLabel}</h3>

      <div className="overview-grid">
        <section className="overview-card">
          <h3>Dagens planering</h3>

          {isLoading ? (
            <p>Laddar dagens planering...</p>
          ) : error ? (
            <p>{error}</p>
          ) : planningItems.length === 0 ? (
            <p>Inget planerat idag.</p>
          ) : (
            <ul className="overview-list">
              {planningItems.map((item) => (
                <li key={item.id} className="overview-list-item">
                  <div className="overview-list-item__time">
                    {item.startTime}–{item.endTime}
                  </div>

                  <div className="overview-list-item__content">
                    <div className="overview-list-item__title">
                      {item.title}
                    </div>

                    <div className="overview-list-item__meta">
                      <span>{item.type}</span>
                      {item.location ? <span> • {item.location}</span> : null}
                    </div>

                    {item.note ? (
                      <div className="overview-list-item__note">
                        {item.note}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overview-card">
          <h2>Behöver åtgärdas</h2>

          {isLoading ? (
            <p>Laddar...</p>
          ) : error ? (
            <p>{error}</p>
          ) : incompleteItems.length === 0 ? (
            <p>Allt ser klart ut 🎉</p>
          ) : (
            <ul className="overview-list">
              {incompleteItems.map((item) => (
                <li
                  key={item.id}
                  className="overview-list-item overview-list-item--clickable"
                  onClick={() => onIncompleteItemClick?.(item)}
                >
                  <div className="overview-list-item__content">
                    <div className="overview-list-item__title">
                      {item.title}
                    </div>
                    <div className="overview-list-item__note">{item.issue}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="overview-card">
          <h3>Mailbevakning</h3>
          <p>Ingen mailbevakning inkopplad ännu.</p>
        </section>
      </div>
    </div>
  );
}
