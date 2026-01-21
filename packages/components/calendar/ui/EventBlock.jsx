import React from "react";
import { format } from "date-fns";

export default function EventBlock({ event, top, height }) {
  return (
    <div
      className="event-block"
      style={{
        top,
        height,
      }}
      title={`${format(event.start, "HH:mm")}–${format(event.end, "HH:mm")}`}
    >
      <div className="event-title">{event.title}</div>
      <div className="event-time">
        {format(event.start, "HH:mm")}–{format(event.end, "HH:mm")}
      </div>
    </div>
  );
}
