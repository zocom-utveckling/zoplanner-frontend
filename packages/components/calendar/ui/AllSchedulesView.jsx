import { useMemo } from "react";
import {
  differenceInMinutes,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { isSameDay } from "date-fns";
import sv from "date-fns/locale/sv";

const HOURS_START = 8;
const HOURS_END = 18;
const SLOT_MINUTES = 30;

function minutesFromStartOfDay(date) {
  const start = startOfDay(date);
  return differenceInMinutes(date, start);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatAvailability(value) {
  if (!value) return "";
  if (value === "REMOTE") return "REMOTE";
  if (value === "ONSITE") return "ONSITE";
  if (value === "HYBRID") return "HYBRID";
  return String(value).toUpperCase();
}

export default function AllSchedulesView({
  view,
  focusDate,
  weekDays = [],
  events,
  sortBy,
  onEventClick,
  onDaySelect,
}) {
  const timeSlots = useMemo(() => {
    const slots = [];

    for (let h = HOURS_START; h <= HOURS_END; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        if (h === HOURS_END && m > 0) break;
        slots.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        );
      }
    }

    return slots;
  }, []);

  const monthDays = useMemo(() => {
    const safeDate = focusDate || new Date();
    return eachDayOfInterval({
      start: startOfMonth(safeDate),
      end: endOfMonth(safeDate),
    });
  }, [focusDate]);

  const { consultantRows, unassignedEvents } = useMemo(() => {
    const rowsByConsultant = new Map();
    const unassigned = [];

    events.forEach((eventItem) => {
      const consultantName = eventItem?.context?.consultant || "";
      const availability =
        eventItem?.context?.availability || eventItem?.locationType || "";

      if (!consultantName) {
        unassigned.push(eventItem);
        return;
      }

      if (!rowsByConsultant.has(consultantName)) {
        rowsByConsultant.set(consultantName, {
          name: consultantName,
          availability: formatAvailability(availability),
          events: [],
        });
      }

      const row = rowsByConsultant.get(consultantName);
      if (!row.availability && availability) {
        row.availability = formatAvailability(availability);
      }
      row.events.push(eventItem);
    });

    const rows = Array.from(rowsByConsultant.values()).sort((rowA, rowB) => {
      const compare = rowA.name.localeCompare(rowB.name, "sv", {
        sensitivity: "base",
      });
      return sortBy === "name-desc" ? -compare : compare;
    });

    rows.forEach((row) => {
      row.events.sort((eventA, eventB) => eventA.start - eventB.start);
    });

    return {
      consultantRows: rows,
      unassignedEvents: unassigned,
    };
  }, [events, sortBy]);

  return (
    <div className="all-schedules-layout">
      <aside className="all-schedules-unassigned">
        <h3>Ej tilldelade pass</h3>
        {unassignedEvents.length > 0 ? (
          <p>{unassignedEvents.length} pass saknar lärare i vald period.</p>
        ) : (
          <p>Det finns inga ej tilldelade pass i vald period.</p>
        )}
      </aside>

      <section className="all-schedules-board">
        {view === "week" && weekDays.length > 0 ? (
          <div className="all-schedules-weekdays">
            {weekDays.map((day) => (
              <button
                key={day.toISOString()}
                type="button"
                className={`all-schedules-weekdays__item ${
                  focusDate && isSameDay(day, focusDate)
                    ? "all-schedules-weekdays__item--active"
                    : ""
                }`}
                onClick={() => onDaySelect?.(day)}
              >
                {format(day, "EEEE d MMM", { locale: sv })}
              </button>
            ))}
          </div>
        ) : null}

        {view === "month" && monthDays.length > 0 ? (
          <div
            className="all-schedules-monthdays"
            role="tablist"
            aria-label="Månadens dagar"
          >
            {monthDays.map((day) => (
              <button
                key={day.toISOString()}
                type="button"
                className={`all-schedules-monthdays__item ${
                  focusDate && isSameDay(day, focusDate)
                    ? "all-schedules-monthdays__item--active"
                    : ""
                }`}
                onClick={() => onDaySelect?.(day)}
              >
                {format(day, "EEE d", { locale: sv })}
              </button>
            ))}
          </div>
        ) : null}

        <div className="all-schedules-board__viewport">
          <div className="all-schedules-board__header">
            <div className="all-schedules-board__name-col" />
            <div
              className="all-schedules-board__timeline-header"
              style={{
                gridTemplateColumns: `repeat(${timeSlots.length}, minmax(52px, 1fr))`,
              }}
            >
              {timeSlots.map((timeLabel) => (
                <span key={timeLabel}>{timeLabel}</span>
              ))}
            </div>
          </div>

          <div className="all-schedules-board__rows">
            {consultantRows.map((row) => (
              <div key={row.name} className="all-schedules-row">
                <div className="all-schedules-row__name-col">
                  <div className="all-schedules-row__name">{row.name}</div>
                  {row.availability ? (
                    <div className="all-schedules-row__availability">
                      {row.availability}
                    </div>
                  ) : null}
                </div>

                <div className="all-schedules-row__timeline">
                  <div
                    className="all-schedules-row__slots"
                    style={{
                      gridTemplateColumns: `repeat(${timeSlots.length}, minmax(52px, 1fr))`,
                    }}
                  >
                    {timeSlots.map((timeLabel) => (
                      <span
                        key={`${row.name}-${timeLabel}`}
                        className="all-schedules-row__slot"
                      />
                    ))}
                  </div>

                  {row.events.map((eventItem) => {
                    const gridStartMin = HOURS_START * 60;
                    const gridEndMin = HOURS_END * 60;
                    const startMin = minutesFromStartOfDay(eventItem.start);
                    const endMin = minutesFromStartOfDay(eventItem.end);
                    const safeEndMin = Math.max(endMin, startMin + 30);

                    const visibleStart = clamp(
                      startMin,
                      gridStartMin,
                      gridEndMin,
                    );
                    const visibleEnd = clamp(
                      safeEndMin,
                      gridStartMin,
                      gridEndMin,
                    );
                    const totalGridMin = gridEndMin - gridStartMin;

                    const left =
                      ((visibleStart - gridStartMin) / totalGridMin) * 100;
                    const width =
                      ((visibleEnd - visibleStart) / totalGridMin) * 100;

                    if (width <= 0) {
                      return null;
                    }

                    return (
                      <button
                        key={eventItem.id}
                        type="button"
                        className="all-schedules-event"
                        style={{ left: `${left}%`, width: `${width}%` }}
                        onClick={() => onEventClick?.(eventItem)}
                      >
                        <div className="all-schedules-event__title">
                          {eventItem.title}
                        </div>
                        <div className="all-schedules-event__meta">
                          {format(eventItem.start, "HH:mm")}-
                          {format(eventItem.end, "HH:mm")} ·{" "}
                          {eventItem.subtitle || "Uppdrag"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {consultantRows.length === 0 ? (
              <div className="all-schedules-empty">
                Inga scheman matchar valda filter.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
