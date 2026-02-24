export default function EventBlock({ event, top, height }) {
  return (
    <div
      className="event-block"
      style={{
        top,
        height,
      }}
    >
      <div className="event-title">{event.title}</div>
      {event.subtitle ? (
        <div className="event-subtitle">{event.subtitle}</div>
      ) : null}
    </div>
  );
}
