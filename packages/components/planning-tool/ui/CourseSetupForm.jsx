import { useCourseSetupForm } from "../hooks/useCourseSetupForm";

export default function CourseSetupForm({ onSave }) {
  const {
    courseName,
    startDate,
    durationWeeks,
    totalHours,
    sessionCount,
    handleChange,
    handleSubmit,
  } = useCourseSetupForm(onSave);

  return (
    <section className="course-setup">
      <h2>Registrera kurs</h2>

      <form className="course-setup-form" onSubmit={handleSubmit}>
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

        <div className="course-setup-field">
          <label htmlFor="sessionCount">Antal tillfällen</label>
          <input
            id="sessionCount"
            name="sessionCount"
            type="number"
            min="1"
            placeholder="Till exmepel 8"
            value={sessionCount}
            onChange={handleChange}
          ></input>
        </div>

        <button type="submit">Spara kurs</button>
      </form>
    </section>
  );
}
