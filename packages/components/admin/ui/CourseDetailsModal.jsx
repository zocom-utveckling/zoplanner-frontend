import { useMemo } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { PlannerMonthView } from "@zoplanner/planning-tool";
import "./index.css";

export default function CourseDetailsModal({ isOpen, onClose, course }) {
  if (!isOpen || !course) return null;

  const sessions = course.sessions ?? [];
  const focusDate = course?.startDate ? new Date(course.startDate) : new Date();

  const monthGridDays = useMemo(() => {
    if (course?.startDate && course?.endDate) {
      const [sy, sm, sd] = course.startDate.split("-").map(Number);
      const [ey, em, ed] = course.endDate.split("-").map(Number);

      const courseStart = new Date(sy, sm - 1, sd);
      const courseEnd = new Date(ey, em - 1, ed);

      return eachDayOfInterval({
        start: startOfWeek(courseStart, { weekStartsOn: 1 }),
        end: endOfWeek(courseEnd, { weekStartsOn: 1 }),
      });
    }

    return [];
  }, [course]);

  const events = useMemo(() => {
    return sessions
      .filter((session) => session.timeStart && session.timeEnd)
      .map((session, index) => ({
        id: session.id ?? String(index + 1),
        title: session.comment || session.title || `Pass ${index + 1}`,
        type: "session",
        start: new Date(session.timeStart),
        end: new Date(session.timeEnd),
      }));
  }, [sessions]);

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="course-details-modal__overlay" onClick={handleOverlayClick}>
      <div
        className="course-details-modal__content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="course-details-modal__header">
          <div>
            <h2 className="course-details-modal__title">
              {course.name || "Kursschema"}
            </h2>
            <p className="course-details-modal__meta">
              {course.customer || "Okänd kund"} · {course.startDate} –{" "}
              {course.endDate}
            </p>
          </div>

          <button
            className="course-details-modal__close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="course-details-modal__body">
          <div className="course-details-modal__calendar">
            <PlannerMonthView
              monthGridDays={monthGridDays}
              focusDate={focusDate}
              events={events}
            />
          </div>

          <aside className="course-details-modal__sidebar">
            <div className="course-details-modal__section">
              <h3>Kursschema</h3>
              <p>
                <strong>Status:</strong> {course.status || "Ej angiven"}
              </p>
              <p>
                <strong>Antal lektionstillfällen:</strong> {sessions.length}
              </p>
            </div>

            <div className="course-details-modal__section">
              <h3>Lektionstillfällen</h3>

              {sessions.length === 0 ? (
                <p className="course-details-modal__empty">
                  Inga lektionstillfällen finns ännu.
                </p>
              ) : (
                <ul className="course-details-modal__session-list">
                  {sessions.map((session, index) => (
                    <li
                      key={session.id ?? index}
                      className="course-details-modal__session-item"
                    >
                      <div className="course-details-modal__session-title">
                        {session.comment ||
                          session.title ||
                          `Pass ${index + 1}`}
                      </div>
                      <div className="course-details-modal__session-time">
                        {formatSessionDateTime(session.timeStart)} –{" "}
                        {formatSessionTime(session.timeEnd)}
                      </div>
                      <div className="course-details-modal__session-location">
                        {formatLocation(session.location)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="course-details-modal__actions">
              <button type="button" className="course-details-modal__secondary">
                Hitta konsult
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function formatSessionDateTime(dateTimeString) {
  if (!dateTimeString) return "";

  const date = new Date(dateTimeString);
  return `${format(date, "yyyy-MM-dd")} ${format(date, "HH:mm")}`;
}

function formatSessionTime(dateTimeString) {
  if (!dateTimeString) return "";

  const date = new Date(dateTimeString);
  return format(date, "HH:mm");
}

function formatLocation(location) {
  if (location === "REMOTE") return "Distans";
  if (location === "ONSITE") return "På plats";
  return location || "Ej angiven";
}
