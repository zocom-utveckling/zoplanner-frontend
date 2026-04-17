import { useMemo, useState } from "react";
import "./index.css";

export default function ConsultantMatchPanel({
  assignment,
  consultants = [],
  onSelectConsultant,
  onBack,
}) {
  const [subjectFilter, setSubjectFilter] = useState("");
  const [includeConflicts, setIncludeConflicts] = useState(false);

  const courseSessions = assignment?.sessions ?? [];

  const uniqueSubjects = useMemo(() => {
    return [...new Set(consultants.map((c) => c.subject).filter(Boolean))];
  }, [consultants]);

  const consultantRows = useMemo(() => {
    return consultants
      .map((consultant) => {
        const schedule = consultant.schedule ?? [];

        const conflictCount = countScheduleConflicts(courseSessions, schedule);
        const availableHours = calculateAvailableHours(schedule);

        return {
          ...consultant,
          conflictCount,
          availableHours,
          isAvailableInWindow: availableHours > 0,
        };
      })
      .filter((consultant) => {
        if (subjectFilter && consultant.subject !== subjectFilter) {
          return false;
        }

        if (!includeConflicts && consultant.conflictCount > 0) {
          return false;
        }

        return consultant.isAvailableInWindow;
      })
      .sort((a, b) => {
        if (a.conflictCount !== b.conflictCount) {
          return a.conflictCount - b.conflictCount;
        }

        return b.availableHours - a.availableHours;
      });
  }, [consultants, courseSessions, subjectFilter, includeConflicts]);

  return (
    <section className="consultant-match-panel">
      <div className="consultant-match-panel__header">
        <div>
          <h2 className="consultant-match-panel__title">Hitta konsult</h2>
          <p className="consultant-match-panel__meta">
            {assignment?.course?.name || "Planering"} · {assignment?.dateStart}{" "}
            – {assignment?.dateEnd}
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            className="consultant-match-panel__back"
            onClick={onBack}
          >
            Avbyt
          </button>
        )}
      </div>

      <div className="consultant-match-panel__filters">
        <div className="consultant-match-panel__field">
          <label htmlFor="consultant-subject">Ämnesområde</label>
          <select
            id="consultant-subject"
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
          >
            <option value="">Alla ämnesområden</option>
            {uniqueSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <label className="consultant-match-panel__checkbox">
          <input
            type="checkbox"
            checked={includeConflicts}
            onChange={(event) => setIncludeConflicts(event.target.checked)}
          />
          Visa även konsulter med krockar
        </label>
      </div>

      <div className="consultant-match-panel__results">
        {consultantRows.length === 0 ? (
          <p className="consultant-match-panel__empty">
            Inga konsulter matchar det valda filtret.
          </p>
        ) : (
          consultantRows.map((consultant) => (
            <div key={consultant.id} className="consultant-match-panel__card">
              <div className="consultant-match-panel__card-top">
                <div>
                  <h3 className="consultant-match-panel__name">
                    {consultant.name}
                  </h3>
                  <p className="consultant-match-panel__subject">
                    {consultant.subject || "Ämnesområde saknas"}
                  </p>
                </div>

                <button
                  type="button"
                  className="consultant-match-panel__select"
                  onClick={() => onSelectConsultant?.(consultant)}
                >
                  Välj
                </button>
              </div>

              <div className="consultant-match-panel__stats">
                <span>Krockar: {consultant.conflictCount}</span>
                <span>Ledig tid 08–19: {consultant.availableHours} h</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function countScheduleConflicts(courseSessions, consultantSchedule) {
  return courseSessions.reduce((count, session) => {
    const hasConflict = consultantSchedule.some((bookedItem) =>
      rangesOverlap(
        session.timeStart,
        session.timeEnd,
        bookedItem.timeStart,
        bookedItem.timeEnd,
      ),
    );

    return hasConflict ? count + 1 : count;
  }, 0);
}

function calculateAvailableHours(schedule) {
  const workdayStart = 8;
  const workdayEnd = 19;
  const totalWindowHours = workdayEnd - workdayStart;

  const bookedHours = schedule.reduce((sum, item) => {
    const start = new Date(item.timeStart);
    const end = new Date(item.timeEnd);

    const hours = (end - start) / (1000 * 60 * 60);
    return sum + Math.max(0, hours);
  }, 0);

  return Math.max(0, Math.round((totalWindowHours - bookedHours) * 10) / 10);
}

function rangesOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart < bEnd && bStart < aEnd;
}
