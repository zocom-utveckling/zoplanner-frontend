export default function EventBlock({
  event,
  top,
  height,
  style,
  onClick,
  draggable,
  onDragStart,
}) {
  return (
    <div
      className="event-block"
      style={{
        top,
        height,
        ...style,
        cursor: draggable ? "grab" : undefined,
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => onClick?.(event)}
    >
      <div className="event-title">{event.title}</div>
      {event.subtitle ? (
        <div className="event-subtitle">{event.subtitle}</div>
      ) : null}
    </div>
  );
}
