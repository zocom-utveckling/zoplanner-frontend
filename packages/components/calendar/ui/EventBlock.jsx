export default function EventBlock({ event, top, height }) {
  const tooltip = event.subtitle
    ? `${event.title}\n${event.subtitle}`
    : event.title;

  return (
    <div
      className="event-block"
      style={{
        top,
        height,
      }}
      title={tooltip}
    >
      <div className="event-title">{event.title}</div>
      {event.subtitle ? (
        <div className="event-subtitle">{event.subtitle}</div>
      ) : null}
    </div>
  );
}
