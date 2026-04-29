import {
  getDashboardEventColorVars,
  getBookingWeekdayColorVars,
} from "../core/utils/eventColors";

export default function EventBlock({
  event,
  top,
  height,
  style,
  onClick,
  draggable,
  onDragStart,
  bookingWeekColors,
}) {
  const cardHeight = Number(height) || 0;
  const isCompactEvent = cardHeight <= 32;
  const isMediumEvent = cardHeight > 32 && cardHeight < 60;
  const startMs = event?.start ? new Date(event.start).getTime() : NaN;
  const endMs = event?.end ? new Date(event.end).getTime() : NaN;
  const hasValidDuration = Number.isFinite(startMs) && Number.isFinite(endMs);
  const durationMinutes = hasValidDuration
    ? Math.max(0, Math.round((endMs - startMs) / 60000))
    : NaN;
  const isShortDurationEvent =
    (Number.isFinite(durationMinutes) && durationMinutes <= 45) ||
    cardHeight <= 42;
  const sizeClass = isCompactEvent
    ? "event-block--compact"
    : isMediumEvent
      ? "event-block--medium"
      : "event-block--roomy";
  const isActivityEvent = event?.source === "activity";
  const isBookingColored =
    !isActivityEvent && bookingWeekColors && event?.start;
  const activityColorStyle = isActivityEvent
    ? getDashboardEventColorVars(event?.color)
    : isBookingColored
      ? getBookingWeekdayColorVars(event.start)
      : {};

  return (
    <div
      className={`event-block ${sizeClass} ${isActivityEvent || isBookingColored ? "event-block--activity" : ""} ${isShortDurationEvent ? "event-block--short-duration" : ""}`}
      style={{
        top,
        height,
        ...activityColorStyle,
        ...style,
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
    >
      {isShortDurationEvent && event.subtitle ? (
        <div className="event-inline-row">
          <div className="event-title">{event.title}</div>
          <div className="event-subtitle event-subtitle--inline">
            {event.subtitle}
          </div>
        </div>
      ) : (
        <>
          <div className="event-title">{event.title}</div>
          {event.subtitle ? (
            <div className="event-subtitle">{event.subtitle}</div>
          ) : null}
        </>
      )}
    </div>
  );
}
