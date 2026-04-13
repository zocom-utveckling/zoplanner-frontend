export function CourseSummary({ assignment }) {
  if (!assignment) return null;

  const sessions = assignment.sessions ?? [];

  return (
    <div style={styles.card}>
      {/* Titel */}
      <h3 style={styles.title}>{assignment.course?.name || "Kursschema"}</h3>

      {/* Period */}
      <p style={styles.text}>
        {assignment.dateStart} – {assignment.dateEnd}
      </p>

      {/* Antal tillfällen */}
      <p style={styles.text}>{sessions.length} lektionstillfällen</p>

      {/* Sessions lista */}
      <ul style={styles.list}>
        {sessions.map((session, index) => (
          <li key={session.id ?? index} style={styles.listItem}>
            <span>
              {formatDateTime(session.timeStart)} –{" "}
              {formatTime(session.timeEnd)}
            </span>
            {session.comment && (
              <span style={styles.comment}> – {session.comment}</span>
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

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "12px",
    backgroundColor: "#fff",
  },
  title: {
    margin: "0 0 6px 0",
  },
  text: {
    margin: "4px 0",
    fontSize: "14px",
  },
  list: {
    marginTop: "8px",
    paddingLeft: "16px",
  },
  listItem: {
    marginBottom: "4px",
    fontSize: "14px",
  },
  comment: {
    color: "#555",
  },
};
