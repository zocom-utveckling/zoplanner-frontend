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

function overlaps(a, b) {
  return a.start < b.end && b.start < a.end;
}

function addRenderMetadata(eventItem, index) {
  return {
    ...eventItem,
    __renderKey: `${eventItem.id ?? "event"}-${eventItem.start?.getTime?.() ?? ""}-${eventItem.end?.getTime?.() ?? ""}-${index}`,
  };
}

function buildEventLayout(dayEvents) {
  const sorted = dayEvents.map(addRenderMetadata).sort((eventA, eventB) => {
    const byStart = eventA.start - eventB.start;
    if (byStart !== 0) return byStart;
    return eventA.end - eventB.end;
  });

  const positionedEvents = [];
  let currentGroup = [];

  function finalizeGroup() {
    if (currentGroup.length === 0) return;

    const laneEndTimes = [];
    const groupPlaced = [];

    currentGroup.forEach((eventItem) => {
      let lane = laneEndTimes.findIndex(
        (endTime) => endTime <= eventItem.start,
      );
      if (lane === -1) {
        lane = laneEndTimes.length;
      }

      laneEndTimes[lane] = eventItem.end;
      groupPlaced.push({ eventItem, lane });
    });

    const laneCount = Math.max(laneEndTimes.length, 1);
    groupPlaced.forEach(({ eventItem, lane }) => {
      positionedEvents.push({
        ...eventItem,
        __lane: lane,
        __laneCount: laneCount,
      });
    });

    currentGroup = [];
  }

  sorted.forEach((eventItem) => {
    if (currentGroup.length === 0) {
      currentGroup = [eventItem];
      return;
    }

    const intersectsGroup = currentGroup.some((groupEvent) =>
      overlaps(groupEvent, eventItem),
    );

    if (intersectsGroup) {
      currentGroup.push(eventItem);
      return;
    }

    finalizeGroup();
    currentGroup = [eventItem];
  });

  finalizeGroup();

  return positionedEvents;
}

export default function TimeGridView({
  days,
  events,
  onEventClick,
  onEventDrop,
  bookingWeekColors,
  onDayClick,
}) {
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
            const positionedDayEvents = buildEventLayout(dayEvents);

            return (
              <div
                key={day.toISOString()}
                className="day-col"
                style={{ height: dayColumnHeight }}
                onDragOver={(evt) => {
                  if (onEventDrop) evt.preventDefault();
                }}
                onDrop={(evt) => {
                  evt.preventDefault();
                  const raw = evt.dataTransfer.getData("application/json");
                  if (!raw) return;
                  const { eventId, startMs, endMs } = JSON.parse(raw);
                  const durationMs = endMs - startMs;
                  const rect = evt.currentTarget.getBoundingClientRect();
                  const relativeY = Math.max(0, evt.clientY - rect.top);
                  const rawSlotIndex = Math.floor(relativeY / gridRowHeight);
                  const slotIndex = Math.max(
                    0,
                    Math.min(rawSlotIndex, timeSlots.length - 1),
                  );
                  const { h, m } = timeSlots[slotIndex];
                  const newStart = new Date(day);
                  newStart.setHours(h, m, 0, 0);
                  const newEnd = new Date(newStart.getTime() + durationMs);
                  onEventDrop?.(eventId, newStart, newEnd);
                }}
                onClick={(evt) => {
                  // Lägg till aktivitet om man klickar på tom yta
                  if (onDayClick) {
                    const rect = evt.currentTarget.getBoundingClientRect();
                    const relativeY = Math.max(0, evt.clientY - rect.top);
                    const rawSlotIndex = Math.floor(relativeY / gridRowHeight);
                    const slotIndex = Math.max(
                      0,
                      Math.min(rawSlotIndex, timeSlots.length - 1),
                    );
                    const { h, m } = timeSlots[slotIndex];
                    const slotDate = new Date(day);
                    slotDate.setHours(h, m, 0, 0);
                    onDayClick(slotDate);
                  }
                }}
              >
                {/* slot backgrounds */}
                {timeSlots.map(({ h, m }, idx) => (
                  <div
                    key={`${day.toISOString()}-${h}:${m}`}
                    className="day-slot-bg"
                    style={{
                      height: gridRowHeight,
                      borderTop:
                        idx === 0 ? "none" : "1px solid var(--border-subtle)",
                    }}
                  />
                ))}

                {/* events */}
                {positionedDayEvents.map((e) => {
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

                  const laneCount = Math.max(e.__laneCount || 1, 1);
                  const lane = Math.max(e.__lane || 0, 0);
                  const laneStartPercent = (lane / laneCount) * 100;
                  const laneEndPercent = ((lane + 1) / laneCount) * 100;

                  const horizontalStyle =
                    laneCount > 1
                      ? {
                          left: `calc(${laneStartPercent}% + 8px)`,
                          right: `calc(${100 - laneEndPercent}% + 8px)`,
                        }
                      : undefined;

                  return (
                    <EventBlock
                      key={e.__renderKey}
                      event={e}
                      top={top}
                      height={height}
                      style={horizontalStyle}
                      onClick={onEventClick}
                      draggable={e.source === "activity"}
                      bookingWeekColors={bookingWeekColors}
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
