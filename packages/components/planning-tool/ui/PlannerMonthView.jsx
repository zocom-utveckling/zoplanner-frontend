import "./index.css";

import {
  format,
  getDay,
  getISOWeek,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";

export default function PlannerMonthView({
  monthGridDays,
  focusDate,
  events,
  onDayClick,
  onEventClick,
}) {
  const weekdays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

  const weeks = [];
  for (let i = 0; i < monthGridDays.length; i += 7) {
    weeks.push(monthGridDays.slice(i, i + 7));
  }

  return (
    <div className="planner-month-wrap">
      <div className="planner-month-weekdays">
        <div className="planner-month-weeknumber-header">V.</div>
        {weekdays.map((w) => (
          <div key={w} className="planner-month-weekday-cell">
            {w}
          </div>
        ))}
      </div>

      <div className="planner-month-grid">
        {weeks.map((week) => {
          const weekNumber = getISOWeek(week[0]);

          return (
            <div key={week[0].toISOString()} className="planner-month-week-row">
              <div className="planner-month-weeknumber-cell"> {weekNumber}</div>
              {week.map((d) => {
                const inMonth = isSameMonth(d, focusDate);
                const dayOfWeek = getDay(d);
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                const dayEvents = events
                  .filter((e) => {
                    if (isSameDay(e.start, d)) return true;
                    if (!e.end) return false;
                    return isWithinInterval(d, {
                      start: startOfDay(e.start),
                      end: endOfDay(e.end),
                    });
                  })
                  .slice(0, 2);

                return (
                  <div
                    key={d.toISOString()}
                    className={[
                      "planner-month-cell",
                      !inMonth ? "planner-month-cell--out-of-month" : "",
                      isSameDay(d, focusDate)
                        ? "planner-month-cell--focus-day"
                        : "",
                      isWeekend ? "planner-month-cell--weekend" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onDayClick?.(d)}
                  >
                    <div className="planner-month-cell-header">
                      {format(d, "d")}
                    </div>
                    <div className="planner-month-events">
                      {dayEvents.map((e) => {
                        const isMultiDay = Boolean(
                          e.end && !isSameDay(e.start, e.end),
                        );
                        const pillClass = [
                          "planner-month-event-pill",
                          isMultiDay
                            ? "planner-month-event-pill--start"
                            : "planner-month-event-pill--single",
                        ].join(" ");

                        return (
                          <div
                            key={e.id}
                            className={pillClass}
                            onClick={(event) => {
                              event.stopPropagation();
                              onEventClick?.(e);
                            }}
                          >
                            {e.title.split("\n")[0]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
