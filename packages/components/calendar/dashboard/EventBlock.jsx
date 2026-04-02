export default function EventBlock({ event, top, height, style, onClick }) {
  return (
    <div
      className="event-block"
      style={{
        top,
        height,
        ...style,
      }}
      onClick={() => onClick?.(event)}
    >
      <div className="event-title">{event.title}</div>
      {event.subtitle ? (
        <div className="event-subtitle">{event.subtitle}</div>
      ) : null}
    </div>
  );
}
