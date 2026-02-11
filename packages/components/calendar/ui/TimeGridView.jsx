import { useMemo } from "react";
import { format, startOfDay, isSameDay, differenceInMinutes } from "date-fns";
import sv from "date-fns/locale/sv";
import EventBlock from "./EventBlock";

const HOURS_START = 8;
const HOURS_END = 17;
const SLOT_MINUTES = 30;

function minutesFromStartOfDay(date) {
  const start = startOfDay(date);
  return differenceInMinutes(date, start);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function TimeGridView({ days, events }) {
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = HOURS_START; h <= HOURS_END; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        if (h === HOURS_END && m > 0) break;
        slots.push({ h, m });
      }
    }
    return slots;
  }, []);

  const gridRowHeight = 28;
  const minutesPerSlot = SLOT_MINUTES;
  const totalSlots = timeSlots.length;
  const dayColumnHeight = totalSlots * gridRowHeight;

  return (
    <div className="time-grid-wrap">
      {/* Header row */}
      <div className="time-grid-header">
        <div className="corner-cell" />
        <div
          className="days-header"
          style={{
            gridTemplateColumns: `repeat(${days.length}, 1fr)`,
          }}
        >
          {days.map((d) => (
            <div key={d.toISOString()} className="day-header-cell">
              <div style={{ fontWeight: 600 }}>
                {format(d, "EEEE d MMM", { locale: sv })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="time-grid-body">
        {/* Time labels */}
        <div className="time-col">
          {timeSlots.map(({ h, m }) => {
            const showLabel = m === 0;
            return (
              <div
                key={`${h}:${m}`}
                className="time-slot"
                style={{
                  height: gridRowHeight,
                }}
              >
                {showLabel ? (
                  <span className="time-label">
                    {String(h).padStart(2, "0")}:00
                  </span>
                ) : null}
                <div className="slot-line" />
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        <div
          className="days-cols"
          style={{
            gridTemplateColumns: `repeat(${days.length}, 1fr)`,
          }}
        >
          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(e.start, day));

            return (
              <div
                key={day.toISOString()}
                className="day-col"
                style={{ height: dayColumnHeight }}
              >
                {/* slot backgrounds */}
                {timeSlots.map(({ h, m }, idx) => (
                  <div
                    key={`${day.toISOString()}-${h}:${m}`}
                    className="day-slot-bg"
                    style={{
                      height: gridRowHeight,
                      borderTop: idx === 0 ? "none" : "1px solid #eef1f6",
                    }}
                  />
                ))}

                {/* events */}
                {dayEvents.map((e) => {
                  const startMin = minutesFromStartOfDay(e.start);
                  const endMin = minutesFromStartOfDay(e.end);

                  const gridStartMin = HOURS_START * 60;
                  const gridEndMin = HOURS_END * 60;

                  const topMin =
                    clamp(startMin, gridStartMin, gridEndMin) - gridStartMin;
                  const durMin =
                    clamp(endMin, gridStartMin, gridEndMin) -
                    clamp(startMin, gridStartMin, gridEndMin);

                  const top = (topMin / minutesPerSlot) * gridRowHeight;
                  const height = Math.max(
                    (durMin / minutesPerSlot) * gridRowHeight,
                    18,
                  );

                  return (
                    <EventBlock
                      key={e.id}
                      event={e}
                      top={top}
                      height={height}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
