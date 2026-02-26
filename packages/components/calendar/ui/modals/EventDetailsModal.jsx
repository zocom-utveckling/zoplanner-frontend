import { format } from "date-fns";
import sv from "date-fns/locale/sv";

export default function EventDetailsModal({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="scheduler-modal-overlay" onClick={onClose}>
      <div
        className="scheduler-modal-content"
        onClick={(modalEvent) => modalEvent.stopPropagation()}
      >
        <div className="scheduler-modal-header">
          <h2>Detaljer</h2>
          <button className="scheduler-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="scheduler-event-details">
          <div className="scheduler-event-row">
            <span className="scheduler-event-label">Titel</span>
            <span className="scheduler-event-value">{event.title}</span>
          </div>

          <div className="scheduler-event-row">
            <span className="scheduler-event-label">Typ</span>
            <span className="scheduler-event-value">
              {event.type || "event"}
            </span>
          </div>

          <div className="scheduler-event-row">
            <span className="scheduler-event-label">Start</span>
            <span className="scheduler-event-value">
              {event.start
                ? format(event.start, "d MMM yyyy HH:mm", {
                    locale: sv,
                  })
                : "-"}
            </span>
          </div>

          <div className="scheduler-event-row">
            <span className="scheduler-event-label">Slut</span>
            <span className="scheduler-event-value">
              {event.end
                ? format(event.end, "d MMM yyyy HH:mm", {
                    locale: sv,
                  })
                : "-"}
            </span>
          </div>

          <div className="scheduler-event-row scheduler-event-row--column">
            <span className="scheduler-event-label">Beskrivning</span>
            <span className="scheduler-event-value">
              {event.subtitle || "Ingen beskrivning"}
            </span>
          </div>
        </div>

        <div className="scheduler-modal-actions">
          <button
            type="button"
            className="scheduler-btn-submit"
            onClick={onClose}
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}
