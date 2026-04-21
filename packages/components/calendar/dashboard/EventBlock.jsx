import { getDashboardEventColorVars } from "../core/utils/eventColors";

export default function EventBlock({
  event,
  top,
  height,
  style,
  onClick,
  draggable,
  onDragStart,
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
  const activityColorStyle =
    event?.source === "activity"
      ? getDashboardEventColorVars(event?.color)
      : {};

  return (
    <div
      className={`event-block ${sizeClass} ${isShortDurationEvent ? "event-block--short-duration" : ""}`}
      style={{
        top,
        height,
        ...activityColorStyle,
        ...style,
        cursor: draggable ? "grab" : undefined,
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => onClick?.(event)}
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
