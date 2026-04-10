import "./index.css";
import { useCourseSetupForm } from "../../planning-tool/hooks/useCourseSetupForm";

const WEEKDAYS = [
  { key: "MONDAY", label: "Måndag" },
  { key: "TUESDAY", label: "Tisdag" },
  { key: "WEDNESDAY", label: "Onsdag" },
  { key: "THURSDAY", label: "Torsdag" },
  { key: "FRIDAY", label: "Fredag" },
];

export function PlannerSidebarForm({ onSave }) {
  const {
    courseName,
    startDate,
    endDate,
    totalHours,
    handleWeekdayToggle,
    handleWeekdayTimeChange,
    handleChange,
    handleSubmit,
    getStartTimeForDay,
    isSelected,
  } = useCourseSetupForm(onSave);

  return (
    <form className="planner-sidebar-form" onSubmit={handleSubmit}>
      <label>
        Kursnamn
        <input
          name="courseName"
          type="text"
          placeholder="Till exempel React grundkurs"
          value={courseName}
          onChange={handleChange}
        />
      </label>

      <label>
        Totalt antal timmar
        <input
          name="totalHours"
          type="number"
          min="1"
          placeholder="Till exempel 6"
          value={totalHours}
          onChange={handleChange}
        />
      </label>

      <label>
        Startdatum
        <input
          name="startDate"
          type="date"
          value={startDate}
          onChange={handleChange}
        />
      </label>

      <label>
        Slutdatum
        <input
          name="endDate"
          type="date"
          value={endDate}
          onChange={handleChange}
        />
      </label>

      <div className="weekday-group">
        <span>Veckodagar</span>

        {WEEKDAYS.map((weekday) => (
          <div key={weekday.key} className="weekday-item">
            <label>
              <input
                type="checkbox"
                checked={isSelected(weekday.key)}
                onChange={() => handleWeekdayToggle(weekday.key)}
              />
              {weekday.label}
            </label>

            {isSelected(weekday.key) && (
              <input
                type="time"
                value={getStartTimeForDay(weekday.key)}
                onChange={(event) =>
                  handleWeekdayTimeChange(weekday.key, event)
                }
              />
            )}
          </div>
        ))}
      </div>

      <button type="submit">Generera schemautkast</button>
    </form>
  );
}
