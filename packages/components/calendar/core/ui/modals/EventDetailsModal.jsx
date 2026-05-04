import { format } from "date-fns";
import sv from "date-fns/locale/sv";
import ModalOverlay from "./ModalOverlay";

function resolveStatus(start, end) {
  const now = new Date();
  if (end && end < now) return { label: "Avslutad", tone: "ended" };
  if (start && start > now) return { label: "Kommande", tone: "upcoming" };
  return { label: "Pågående", tone: "ongoing" };
}

function formatDateRange(start, end) {
  if (!start || !end) return "-";

  const sameDate = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

  if (sameDate) {
    return `${format(start, "d MMM yyyy", { locale: sv })} · ${format(
      start,
      "HH:mm",
      {
        locale: sv,
      },
    )} - ${format(end, "HH:mm", { locale: sv })}`;
  }

  return `${format(start, "d MMM yyyy HH:mm", {
    locale: sv,
  })} - ${format(end, "d MMM yyyy HH:mm", { locale: sv })}`;
}

function InfoRow({ label, value }) {
  return (
    <div className="scheduler-event-row">
      <span className="scheduler-event-label">{label}</span>
      <span className="scheduler-event-value">{value || "-"}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="scheduler-event-section">
      <h3 className="scheduler-event-section-title">{title}</h3>
      <div className="scheduler-event-section-content">{children}</div>
    </section>
  );
}

function ComingSoonNotice({ text = "Kommer inom kort" }) {
  return (
    <div className="scheduler-coming-soon" role="note" aria-label={text}>
      {text}
    </div>
  );
}

export default function EventDetailsModal({
  event,
  onClose,
  canManageActions,
  onEdit,
  onDelete,
}) {
  const startDate = event?.start ? new Date(event.start) : null;
  const endDate = event?.end ? new Date(event.end) : null;

  const status = resolveStatus(startDate, endDate);
  const description =
    event?.description || event?.subtitle || "Ingen beskrivning";
  const dateTimeLabel = formatDateRange(startDate, endDate);

  const isManager = canManageActions === true;

  if (!event) return null;

  function handleEditClick() {
    if (onEdit) {
      onEdit(event);
      return;
    }
    onClose();
  }

  function handleDeleteClick() {
    if (onDelete) {
      onDelete(event);
      return;
    }
    onClose();
  }

  return (
    <ModalOverlay
      onClose={onClose}
      closeOnEscape
      role="dialog"
      ariaLabel="Detaljer"
    >
        <div className="scheduler-modal-header">
          <h2>Detaljer</h2>
          <button className="scheduler-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="scheduler-event-details scheduler-event-details-view">
          <Section title="Information">
            <InfoRow label="Kurs" value={event?.title} />
            <InfoRow label="Datum/tid" value={dateTimeLabel} />
          </Section>

          <Section title="Status">
            <div className="scheduler-event-row">
              <span className="scheduler-event-label">Aktuell status</span>
              <span
                className={`scheduler-status-badge scheduler-status-${status.tone}`}
              >
                {status.label}
              </span>
            </div>
          </Section>

          <Section title="Plats">
            <ComingSoonNotice text="Platsinformation kommer inom kort" />
          </Section>

          <Section title="Uppdraget">
            <ComingSoonNotice text="Uppdragsinformation kommer inom kort" />
          </Section>

          <Section title="Beskrivning">
            <p className="scheduler-description-text">{description}</p>
          </Section>
        </div>

        <div className="scheduler-modal-actions">
          {isManager ? (
            <>
              <button
                type="button"
                className="scheduler-btn-cancel"
                onClick={handleEditClick}
              >
                Redigera
              </button>
              <button
                type="button"
                className="scheduler-btn-cancel"
                onClick={handleDeleteClick}
              >
                Ta bort
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="scheduler-btn-submit"
            onClick={onClose}
          >
            Stäng
          </button>
        </div>
    </ModalOverlay>
  );
}
