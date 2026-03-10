import {
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";

const MAX_VISIBLE = 3;

export default function MonthView({
  monthGridDays,
  focusDate,
  events,
  onDayClick,
  onEventClick,
  showBookedPerson = false,
  deduplicateConsultantsPerDay = false,
}) {
  const weekdays = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

  function getEventLabel(eventItem) {
    const eventLabel =
      showBookedPerson && eventItem?.context?.consultant
        ? eventItem.context.consultant
        : eventItem.title;

    return String(eventLabel).split("\n")[0];
  }

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
          const allDayEvents = events
            .filter((e) => e.type !== "session")
            .filter((e) => {
              if (isSameDay(e.start, d)) return true;
              if (!e.end) return false;
              return isWithinInterval(d, {
                start: startOfDay(e.start),
                end: endOfDay(e.end),
              });
            });

          let displayDayEvents = allDayEvents;

          if (deduplicateConsultantsPerDay) {
            const seenConsultants = new Set();
            displayDayEvents = allDayEvents.filter((eventItem) => {
              const consultantName = String(
                eventItem?.context?.consultant || "",
              ).trim();

              if (!consultantName) {
                return true;
              }

              const key = consultantName.toLocaleLowerCase("sv");
              if (seenConsultants.has(key)) {
                return false;
              }

              seenConsultants.add(key);
              return true;
            });
          }

          const visibleEvents = displayDayEvents.slice(0, MAX_VISIBLE);
          const hiddenCount = Math.max(0, displayDayEvents.length - MAX_VISIBLE);

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
                {visibleEvents.map((e) => {
                  const isMultiDay = Boolean(
                    e.end && !isSameDay(e.start, e.end),
                  );
                  const pillClass = [
                    "month-event-pill",
                    isMultiDay ? "is-start" : "is-single",
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
                      {getEventLabel(e)}
                    </div>
                  );
                })}

                {hiddenCount > 0 ? (
                  <div
                    className="month-event-pill month-more-pill is-single"
                    onClick={(event) => event.stopPropagation()}
                  >
                    +{hiddenCount} fler
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
