import {
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";

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
            .filter((e) => e.type !== "session")
            .filter((e) => {
              if (isSameDay(e.start, d)) return true;
              if (!e.end) return false;
              return isWithinInterval(d, {
                start: startOfDay(e.start),
                end: endOfDay(e.end),
              });
            })
            .slice(0, 3);

          return (
            <div
              key={d.toISOString()}
              className={[
                "month-cell",
                !inMonth ? "month-cell--out-of-month" : "",
                isSameDay(d, focusDate) ? "month-cell--focus-day" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onDayClick(d)}
            >
              <div className="month-cell-header">{format(d, "d")}</div>
              <div className="month-events">
                {dayEvents.map((e) => {
                  const isStart = isSameDay(e.start, d);
                  const isEnd = e.end ? isSameDay(e.end, d) : isStart;
                  const isMultiDay = Boolean(
                    e.end && !isSameDay(e.start, e.end),
                  );
                  const pillClass = [
                    "month-event-pill",
                    isMultiDay
                      ? isStart
                        ? "is-start"
                        : isEnd
                          ? "is-end"
                          : "is-middle"
                      : "is-single",
                  ].join(" ");

                  return (
                    <div key={e.id} className={pillClass} title={e.title}>
                      {isMultiDay && !isStart ? "" : e.title.split("\n")[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
