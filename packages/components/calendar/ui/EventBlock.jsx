export default function EventBlock({ event, top, height }) {
  return (
    <div
      className="event-block"
      style={{
        top,
        height,
      }}
      title={event.title}
    >
      <div className="event-title">{event.title}</div>
    </div>
  );
}
