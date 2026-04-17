import "./index.css";

export default function CourseSummary({ assignment, onDelete }) {
  if (!assignment) return null;

  const sessions = assignment.sessions ?? [];

  return (
    <div className="course-summary">
      {/* Header med titel + delete */}
      <div className="course-summary__header">
        <h3 className="course-summary__title">
          {assignment.course?.name || "Kursschema"}
        </h3>

        {onDelete && (
          <button
            className="course-summary__delete"
            onClick={() => {
              const confirmed = window.confirm("Vill du radera planeringen?");
              if (confirmed) {
                onDelete();
              }
            }}
          >
            Radera
          </button>
        )}
      </div>

      {/* Period */}
      <p className="course-summary__meta">
        {assignment.dateStart} – {assignment.dateEnd}
      </p>

      {/* Antal tillfällen */}
      <p className="course-summary__meta">
        {sessions.length} lektionstillfällen
      </p>

      {/* Sessions lista */}
      <ul className="course-summary__list">
        {sessions.map((session, index) => (
          <li key={session.id ?? index} className="course-summary__list-item">
            <span className="course-summary__time">
              {formatDateTime(session.timeStart)} –{" "}
              {formatTime(session.timeEnd)}
            </span>

            {session.comment && (
              <span className="course-summary__comment">
                {" "}
                – {session.comment}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "";

  const date = new Date(dateTimeString);

  const datePart = date.toLocaleDateString("sv-SE");
  const timePart = date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} ${timePart}`;
}

function formatTime(dateTimeString) {
  if (!dateTimeString) return "";

  const date = new Date(dateTimeString);

  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
