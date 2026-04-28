import "./index.css";
import Holidays from "date-holidays";

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
  onEventDrop,
}) {
  if (!monthGridDays || monthGridDays.length === 0) {
    return (
      <div className="planner-month-wrap">
        <div className="planner-month-empty">Inget schema att visa</div>
      </div>
    );
  }
  const weekdays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
  const visibleMonths = Array.from(
    new Set(
      monthGridDays.map((day) =>
        format(day, "MMMM").replace(/^./, (c) => c.toUpperCase()),
      ),
    ),
  );

  const visibleYear = monthGridDays[0]
    ? format(new Date(monthGridDays[0]), "yyyy")
    : "";
  const hd = new Holidays("SE");
  const weeks = [];
  for (let i = 0; i < monthGridDays.length; i += 7) {
    weeks.push(monthGridDays.slice(i, i + 7));
  }

  return (
    <div className="planner-month-wrap">
      <div className="planner-month-period-header">
        <div className="planner-month-period-spacer" />
        <div className="planner-month-period-months">
          {visibleMonths.join(" – ")}
        </div>
        <div className="planner-month-period-year">{visibleYear}</div>
      </div>

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
                const dayOfWeek = getDay(d);
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const holiday = hd.isHoliday(d);
                const isHoliday = Boolean(holiday);

                const dayEvents = events
                  .filter((e) => {
                    if (isSameDay(e.start, d)) return true;
                    if (!e.end) return false;
                    return isWithinInterval(d, {
                      start: startOfDay(e.start),
                      end: endOfDay(e.end),
                    });
                  })
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .slice(0, 4);

                return (
                  <div
                    key={d.toISOString()}
                    className={[
                      "planner-month-cell",
                      isSameDay(d, focusDate)
                        ? "planner-month-cell--focus-day"
                        : "",
                      isWeekend ? "planner-month-cell--weekend" : "",
                      isHoliday ? "planner-month-cell--holiday" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onDayClick?.(d)}
                    onDragOver={(event) => {
                      event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();

                      const rawData =
                        event.dataTransfer.getData("application/json");
                      if (!rawData) return;

                      const parsedData = JSON.parse(rawData);
                      onEventDrop?.(parsedData.sessionIndex, d);
                    }}
                  >
                    <div className="planner-month-cell-header">
                      {format(d, "d")}
                    </div>

                    {holiday?.[0]?.name && (
                      <div className="planner-month-holiday">
                        {holiday[0].name}
                      </div>
                    )}

                    <div className="planner-month-events">
                      {dayEvents.map((e) => {
                        const isMultiDay = Boolean(
                          e.end && !isSameDay(e.start, e.end),
                        );
                        const eventFallsOnHoliday = isHoliday;
                        const isDraggable = e.draggable !== false;

                        const pillClass = [
                          "planner-month-event-pill",
                          e.type ? `planner-month-event-pill--${e.type}` : "",
                          !isDraggable
                            ? "planner-month-event-pill--readonly"
                            : "",
                          isMultiDay
                            ? "planner-month-event-pill--start"
                            : "planner-month-event-pill--single",
                          eventFallsOnHoliday
                            ? "planner-month-event-pill--holiday"
                            : "",
                        ].join(" ");

                        return (
                          <div
                            key={e.id}
                            className={pillClass}
                            draggable={isDraggable}
                            onDragStart={(dragEvent) => {
                              if (!isDraggable) {
                                dragEvent.preventDefault();
                                return;
                              }

                              dragEvent.stopPropagation();
                              dragEvent.dataTransfer.setData(
                                "application/json",
                                JSON.stringify({
                                  sessionIndex: e.sessionIndex,
                                }),
                              );
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              onEventClick?.(e);
                            }}
                          >
                            <div className="planner-month-event-content">
                              <span className="planner-month-event-time">
                                {format(e.start, "HH:mm")}
                              </span>
                              <span className="planner-month-event-title">
                                {e.title.split("\n")[0]}
                              </span>
                            </div>
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
