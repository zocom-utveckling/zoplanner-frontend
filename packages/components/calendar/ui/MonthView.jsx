import React from "react";
import { format, isSameDay, isSameMonth } from "date-fns";

export default function MonthView({
  monthGridDays,
  focusDate,
  events,
  onDayClick,
}) {
  const weekdays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

  return (
    <div className="month-wrap">
      <div className="month-weekdays">
        {weekdays.map((w) => (
          <div key={w} className="month-weekday-cell">
            {w}
          </div>
        ))}
      </div>

      <div className="month-grid">
        {monthGridDays.map((d) => {
          const inMonth = isSameMonth(d, focusDate);
          const dayEvents = events
            .filter((e) => isSameDay(e.start, d))
            .slice(0, 3);

          return (
            <div
              key={d.toISOString()}
              className="month-cell"
              style={{
                opacity: inMonth ? 1 : 0.45,
                background: isSameDay(d, focusDate) ? "#f3f6ff" : "#fff",
              }}
              onClick={() => onDayClick(d)}
            >
              <div className="month-cell-header">{format(d, "d")}</div>
              <div className="month-events">
                {dayEvents.map((e) => (
                  <div key={e.id} className="month-event-pill">
                    {e.title.split("\n")[0]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
