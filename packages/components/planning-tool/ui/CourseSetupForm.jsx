import { useCourseSetupForm } from "../hooks/useCourseSetupForm";
import { useState } from "react";

export default function CourseSetupForm({ onSave }) {
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

  const mockCustomers = [
    { id: 1, name: "AcadeMedia" },
    { id: 2, name: "NTI Gymnasiet" },
    { id: 3, name: "Yrgo" },
  ];

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const customers = mockCustomers;

  return (
    <section className="course-setup">
      <form className="course-setup-form" onSubmit={handleSubmit}>
        <div className="course-setup-field-container">
          <div className="course-setup-field">
            <label htmlFor="customer">Kund</label>
            <select
              id="customer"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Välj kund</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="course-setup-field">
            <label htmlFor="courseName">Kursnamn</label>
            <input
              id="courseName"
              name="courseName"
              type="text"
              placeholder="Till exempel React grundkurs"
              value={courseName}
              onChange={handleChange}
            />
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
            />
          </div>

          <div className="course-setup-field">
            <label htmlFor="startDate">Startdatum</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={handleChange}
            />
          </div>

          <div className="course-setup-field">
            <label htmlFor="endDate">Slutdatum</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="course-setup-days">
          <span className="course-setup-days__title">Dag och tid</span>

          <div className="course-setup-days__list">
            <div className="course-setup-day-row">
              <label className="course-setup-day-label">
                <input
                  type="checkbox"
                  checked={isSelected("MONDAY")}
                  onChange={() => handleWeekdayToggle("MONDAY")}
                />
                Måndag
              </label>

              {isSelected("MONDAY") && (
                <input
                  className="course-setup-day-time"
                  type="time"
                  value={getStartTimeForDay("MONDAY")}
                  onChange={(event) => handleWeekdayTimeChange("MONDAY", event)}
                />
              )}
            </div>

            <div className="course-setup-day-row">
              <label className="course-setup-day-label">
                <input
                  type="checkbox"
                  checked={isSelected("TUESDAY")}
                  onChange={() => handleWeekdayToggle("TUESDAY")}
                />
                Tisdag
              </label>

              {isSelected("TUESDAY") && (
                <input
                  className="course-setup-day-time"
                  type="time"
                  value={getStartTimeForDay("TUESDAY")}
                  onChange={(event) =>
                    handleWeekdayTimeChange("TUESDAY", event)
                  }
                />
              )}
            </div>

            <div className="course-setup-day-row">
              <label className="course-setup-day-label">
                <input
                  type="checkbox"
                  checked={isSelected("WEDNESDAY")}
                  onChange={() => handleWeekdayToggle("WEDNESDAY")}
                />
                Onsdag
              </label>

              {isSelected("WEDNESDAY") && (
                <input
                  className="course-setup-day-time"
                  type="time"
                  value={getStartTimeForDay("WEDNESDAY")}
                  onChange={(event) =>
                    handleWeekdayTimeChange("WEDNESDAY", event)
                  }
                />
              )}
            </div>

            <div className="course-setup-day-row">
              <label className="course-setup-day-label">
                <input
                  type="checkbox"
                  checked={isSelected("THURSDAY")}
                  onChange={() => handleWeekdayToggle("THURSDAY")}
                />
                Torsdag
              </label>

              {isSelected("THURSDAY") && (
                <input
                  className="course-setup-day-time"
                  type="time"
                  value={getStartTimeForDay("THURSDAY")}
                  onChange={(event) =>
                    handleWeekdayTimeChange("THURSDAY", event)
                  }
                />
              )}
            </div>

            <div className="course-setup-day-row">
              <label className="course-setup-day-label">
                <input
                  type="checkbox"
                  checked={isSelected("FRIDAY")}
                  onChange={() => handleWeekdayToggle("FRIDAY")}
                />
                Fredag
              </label>

              {isSelected("FRIDAY") && (
                <input
                  className="course-setup-day-time"
                  type="time"
                  value={getStartTimeForDay("FRIDAY")}
                  onChange={(event) => handleWeekdayTimeChange("FRIDAY", event)}
                />
              )}
            </div>
          </div>
        </div>

        <button type="submit">Generera schemautkast</button>
      </form>
    </section>
  );
}
