import "./index.css";
import { useEffect, useState } from "react";

export function AdminOverview({
  planningItems = [],
  incompleteItems = [],
  isLoading = false,
  error = "",
  onIncompleteItemClick,
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const todayLabel = now
    .toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/^./, (char) => char.toUpperCase());

  const timeLabel = now.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="admin-overview">
      <div className="admin-overview__header">
        <h1>
          <span>Idag</span>
          <span>{todayLabel}</span>
        </h1>
        <div className="admin-overview__time">{timeLabel}</div>
      </div>

      <div className="admin-overview__main">
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
              <div className="overview-list-panel">
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
                          {item.location ? (
                            <span> • {item.location}</span>
                          ) : null}
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
              </div>
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
              <div className="overview-list-panel">
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
                        <div className="overview-list-item__note">
                          {item.issue}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="overview-card">
        <h3>Mailbevakning</h3>
        <p>Ingen mailbevakning inkopplad ännu.</p>
      </section>
    </div>
  );
}
