import { useCourseSetupForm } from "../hooks/useCourseSetupForm";

export default function CourseSetupForm({ onSave }) {
  const {
    courseName,
    startDate,
    durationWeeks,
    totalHours,
    selectedWeekdays,
    handleWeekdayToggle,
    handleChange,
    handleSubmit,
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
            <label htmlFor="totalHours">Totalt antal timmar</label>
            <input
              id="totalHours"
              name="totalHours"
              type="number"
              min="1"
              placeholder="Till exempel 8"
              value={totalHours}
              onChange={handleChange}
            ></input>
          </div>
        </div>

        <div className="course-setup-field-container">
          <div className="course-setup-field">
            <label htmlFor="durationWeeks">Antal veckor</label>
            <input
              id="durationWeeks"
              name="durationWeeks"
              type="number"
              min="1"
              placeholder="Till exempel 6"
              value={durationWeeks}
              onChange={handleChange}
            ></input>
          </div>
          <div className="course-setup-field">
            <span>Veckodagar</span>

            <label>
              <input
                type="checkbox"
                checked={selectedWeekdays.includes("MONDAY")}
                onChange={() => handleWeekdayToggle("MONDAY")}
              />
              Måndag
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedWeekdays.includes("TUESDAY")}
                onChange={() => handleWeekdayToggle("TUESDAY")}
              />
              Tisdag
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedWeekdays.includes("WEDNESDAY")}
                onChange={() => handleWeekdayToggle("WEDNESDAY")}
              />
              Onsdag
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedWeekdays.includes("THURSDAY")}
                onChange={() => handleWeekdayToggle("THURSDAY")}
              />
              Torsdag
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedWeekdays.includes("FRIDAY")}
                onChange={() => handleWeekdayToggle("FRIDAY")}
              />
              Fredag
            </label>
          </div>
          <button type="submit">Generera schemautkast</button>
        </div>
      </form>
    </section>
  );
}
