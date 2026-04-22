import { useMemo, useState } from "react";
import { toBusySlots, countConflicts } from "../utils/consultantMatching";
import "./index.css";

export default function ConsultantMatchPanel({
  assignment,
  consultants = [],
  onSelectConsultant,
  onBack,
  selectedConsultantId,
  missingFinalInfo = [],
  onCompleteMissingInfo,
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
        const busySlots = toBusySlots({
          activities: consultant.activities ?? [],
          sessions: consultant.sessions ?? [],
        });

        const conflictCount = countConflicts(courseSessions, busySlots);

        return {
          ...consultant,
          conflictCount,
        };
      })
      .filter((consultant) => {
        if (subjectFilter && consultant.subject !== subjectFilter) {
          return false;
        }

        if (!includeConflicts && consultant.conflictCount > 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.conflictCount - b.conflictCount);
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
            Avbryt
          </button>
        )}
      </div>
      {missingFinalInfo.length > 0 && (
        <div className="consultant-match-panel__warning">
          <p className="consultant-match-panel__warning-text">
            Du måste komplettera följande innan du kan spara slutligt:
          </p>

          <ul className="consultant-match-panel__warning-list">
            {missingFinalInfo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <button
            type="button"
            className="consultant-match-panel__complete"
            onClick={onCompleteMissingInfo}
          >
            Fyll i uppgifter
          </button>
        </div>
      )}
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
            <div
              key={consultant.id}
              className={[
                "consultant-match-panel__card",
                selectedConsultantId === consultant.id
                  ? "consultant-match-panel__card--selected"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
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
                  Visa i kalender
                </button>
              </div>

              <div className="consultant-match-panel__stats">
                <span>Krockar: {consultant.conflictCount}</span>
                {selectedConsultantId === consultant.id && (
                  <span className="consultant-match-panel__preview-tag">
                    Forhandsvisas
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
