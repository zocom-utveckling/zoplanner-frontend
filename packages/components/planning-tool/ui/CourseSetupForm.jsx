import { useCourseSetupForm } from "../hooks/useCourseSetupForm";

export default function CourseSetupForm({ onSave }) {
  const {
    courseName,
    startDate,
    endDate,
    totalHours,
    selectedWeekdays,
    handleWeekdayToggle,
    handleWeekdayTimeChange,
    handleChange,
    handleSubmit,
    getStartTimeForDay,
    isSelected,
  } = useCourseSetupForm(onSave);

  return (
    <section className="course-setup">
      <h2>Kurs och preliminärt schema</h2>

      <form className="course-setup-form" onSubmit={handleSubmit}>
        <div className="course-setup-field-container">
          <div className="course-setup-field">
            <label htmlFor="courseName">Kursnamn</label>
            <input
              id="courseName"
              name="courseName"
              type="text"
              placeholder="Till exempel React grundkurs"
              value={courseName}
              onChange={handleChange}
            ></input>
          </div>
          <div className="course-setup-field">
            <label htmlFor="totalHours">Totalt antal timmar</label>
            <input
              id="totalHours"
              name="totalHours"
              type="number"
              min="1"
              placeholder="Till exempel 6"
              value={totalHours}
              onChange={handleChange}
            ></input>
          </div>
          <div className="course-setup-field">
            <label htmlFor="startDate">StartDatum</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={handleChange}
            ></input>
          </div>

          <div className="course-setup-field">
            <label htmlFor="endDate">Slutdatum</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={handleChange}
            ></input>
          </div>
        </div>

        <div className="course-setup-field-container">
          <div className="course-setup-field">
            <span>Dag och tid</span>

            <label>
              <input
                type="checkbox"
                checked={isSelected("MONDAY")}
                onChange={(event) => handleWeekdayToggle("MONDAY")}
              />
              Måndag
            </label>

            {isSelected("MONDAY") && (
              <input
                type="time"
                value={getStartTimeForDay("MONDAY")}
                onChange={(event) => handleWeekdayTimeChange("MONDAY", event)}
              />
            )}

            <label>
              <input
                type="checkbox"
                checked={isSelected("TUESDAY")}
                onChange={() => handleWeekdayToggle("TUESDAY")}
              />
              Tisdag
            </label>
            {isSelected("TUESDAY") && (
              <input
                type="time"
                value={getStartTimeForDay("TUESDAY")}
                onChange={(event) => handleWeekdayTimeChange("TUESDAY", event)}
              />
            )}

            <label>
              <input
                type="checkbox"
                checked={isSelected("WEDNESDAY")}
                onChange={() => handleWeekdayToggle("WEDNESDAY")}
              />
              Onsdag
            </label>
            {isSelected("WEDNESDAY") && (
              <input
                type="time"
                value={getStartTimeForDay("WEDNESDAY")}
                onChange={(event) =>
                  handleWeekdayTimeChange("WEDNESDAY", event)
                }
              />
            )}

            <label>
              <input
                type="checkbox"
                checked={isSelected("THURSDAY")}
                onChange={() => handleWeekdayToggle("THURSDAY")}
              />
              Torsdag
            </label>
            {isSelected("THURSDAY") && (
              <input
                type="time"
                value={getStartTimeForDay("THURSDAY")}
                onChange={(event) => handleWeekdayTimeChange("THURSDAY", event)}
              />
            )}

            <label>
              <input
                type="checkbox"
                checked={isSelected("FRIDAY")}
                onChange={() => handleWeekdayToggle("FRIDAY")}
              />
              Fredag
            </label>
            {isSelected("FRIDAY") && (
              <input
                type="time"
                value={getStartTimeForDay("FRIDAY")}
                onChange={(event) => handleWeekdayTimeChange("FRIDAY", event)}
              />
            )}
          </div>
          <button type="submit">Generera schemautkast</button>
        </div>
      </form>
    </section>
  );
}
