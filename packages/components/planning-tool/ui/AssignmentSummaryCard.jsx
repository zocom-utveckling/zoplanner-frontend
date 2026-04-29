import "./index.css";

export default function AssignmentSummaryCard({
  customerName,
  courseName,
  className,
  consultantName,
  startDate,
  endDate,
  scheduleSummary,
  onExportPdf,
  onSendMessage,
  onEditFromFinal,
}) {
  return (
    <section className="assignment-summary-card">
      <div className="assignment-summary-card__header">
        <div className="assignment-summary-card__header-main">
          <p className="assignment-summary-card__eyebrow">Uppdrag tilldelat</p>
          <h2 className="assignment-summary-card__title">
            {courseName || "Kursschema"}
          </h2>
        </div>

        {onEditFromFinal && (
          <button
            type="button"
            className="assignment-summary-card__edit-btn"
            onClick={onEditFromFinal}
            title="Gå tillbaka för att redigera uppgiften"
          >
            Redigera uppdraget
          </button>
        )}
      </div>

      <div className="assignment-summary-card__content">
        <div className="assignment-summary-card__row">
          <span className="assignment-summary-card__label">Skola</span>
          <span className="assignment-summary-card__value">
            {customerName || "Saknas"}
          </span>
        </div>

        <div className="assignment-summary-card__row">
          <span className="assignment-summary-card__label">Klass</span>
          <span className="assignment-summary-card__value">
            {className || "Saknas"}
          </span>
        </div>

        <div className="assignment-summary-card__row">
          <span className="assignment-summary-card__label">Konsult</span>
          <span className="assignment-summary-card__value">
            {consultantName || "Ej tilldelad"}
          </span>
        </div>

        <div className="assignment-summary-card__row">
          <span className="assignment-summary-card__label">Period</span>
          <span className="assignment-summary-card__value">
            {startDate} → {endDate}
          </span>
        </div>

        <div className="assignment-summary-card__row assignment-summary-card__row--stacked">
          <span className="assignment-summary-card__label">Upplägg</span>
          <span className="assignment-summary-card__value">
            {scheduleSummary || "Saknas"}
          </span>
        </div>
      </div>

      <div className="assignment-summary-card__actions">
        <button
          type="button"
          className="assignment-summary-card__button assignment-summary-card__button--secondary"
          onClick={onExportPdf}
        >
          Spara som PDF
        </button>

        <button
          type="button"
          className="assignment-summary-card__button assignment-summary-card__button--primary"
          onClick={onSendMessage}
        >
          Skicka som meddelande
        </button>
      </div>
    </section>
  );
}
