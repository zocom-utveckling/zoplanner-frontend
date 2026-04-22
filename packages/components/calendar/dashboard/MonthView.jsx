import {
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { getDashboardEventColorVars } from "../core/utils/eventColors";

const MAX_VISIBLE = 3;

export default function MonthView({
  monthGridDays,
  focusDate,
  events,
  onDayClick,
  onEventClick,
  onEventDrop,
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
            .filter((e) => {
              if (e.type === "session") return isSameDay(e.start, d);
              return true;
            })
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
          const hiddenCount = Math.max(
            0,
            displayDayEvents.length - MAX_VISIBLE,
          );
          const stackedCount = hiddenCount === 0 ? visibleEvents.length : 0;
          const monthEventsClassName = [
            "month-events",
            stackedCount === 1 ? "month-events--single" : "",
            stackedCount === 2 ? "month-events--double" : "",
          ]
            .filter(Boolean)
            .join(" ");

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
              onDragOver={(evt) => {
                if (onEventDrop) evt.preventDefault();
              }}
              onDrop={(evt) => {
                evt.preventDefault();
                const raw = evt.dataTransfer.getData("application/json");
                if (!raw) return;
                const { eventId, startMs, endMs } = JSON.parse(raw);
                const durationMs = endMs - startMs;
                const origStart = new Date(startMs);
                const newStart = new Date(d);
                newStart.setHours(
                  origStart.getHours(),
                  origStart.getMinutes(),
                  0,
                  0,
                );
                const newEnd = new Date(newStart.getTime() + durationMs);
                onEventDrop?.(eventId, newStart, newEnd);
              }}
            >
              <div className="month-cell-header">{format(d, "d")}</div>
              <div className={monthEventsClassName}>
                {visibleEvents.map((e) => {
                  const isMultiDay = Boolean(
                    e.end && !isSameDay(e.start, e.end),
                  );
                  const isActivityEvent = e?.source === "activity";
                  const pillClass = [
                    "month-event-pill",
                    isActivityEvent ? "month-event-pill--activity" : "",
                    !isActivityEvent ? "month-event-pill--non-activity" : "",
                    isMultiDay ? "is-start" : "is-single",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const activityColorStyle = isActivityEvent
                    ? getDashboardEventColorVars(e?.color)
                    : {};

                  return (
                    <div
                      key={e.id}
                      className={pillClass}
                      style={activityColorStyle}
                      draggable={e.source === "activity"}
                      onDragStart={
                        e.source === "activity"
                          ? (evt) => {
                              evt.stopPropagation();
                              evt.dataTransfer.setData(
                                "application/json",
                                JSON.stringify({
                                  eventId: e.id,
                                  startMs: e.start.getTime(),
                                  endMs: e.end.getTime(),
                                }),
                              );
                            }
                          : undefined
                      }
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



