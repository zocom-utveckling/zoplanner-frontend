import { useState } from "react";
import "./index.css";

function MonthCalendar({ variant = "sidebar", onSubmit }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "meeting",
  });

  const monthNames = [
    "Januari",
    "Februari",
    "Mars",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "Augusti",
    "September",
    "Oktober",
    "November",
    "December",
  ];
  const weekDays = ["M", "T", "O", "T", "F", "L", "S"];

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6;

    const daysInMonth = lastDay.getDate();
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isToday = (day) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleDayClick = (day) => {
    if (!day) return;

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const selectedDate = `${year}-${month}-${dayStr}`;

    setFormData({
      title: "",
      description: "",
      date: selectedDate,
      startTime: "",
      endTime: "",
      type: "meeting",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    // Reset form
    setFormData({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "meeting",
    });
    setIsModalOpen(false);
  };

  const days = getDaysInMonth();

  return (
    <div
      className={`month-calendar ${variant === "sidebar" ? "sidebar-variant" : "page-variant"}`}
    >
      <div className="calendar-section-header">
        <button className="nav-btn" onClick={prevMonth}>
          {"<"}
        </button>
        <span className="section-title">Månad</span>
        <button className="nav-btn" onClick={nextMonth}>
          {">"}
        </button>
      </div>

      <div className="month-display">
        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </div>

      <div className="calender-grid">
        {weekDays.map((day, index) => (
          <div key={index} className="weekday-header">
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <div
            key={`day-${index}`}
            className={`calendar-day ${day ? "" : "empty"} ${isToday(day) ? "today" : ""} ${day ? "clickable" : ""}`}
            onClick={() => handleDayClick(day)}
          >
            {day || ""}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lägg till aktivitet</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="activity-form">
              <div className="form-group">
                <label htmlFor="title">Titel *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="T.ex. Möte med kursledare"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Typ av aktivitet *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="meeting">Möte</option>
                  <option value="lecture">Lektion</option>
                  <option value="review">Granskning</option>
                  <option value="preparation">Förberedelse</option>
                  <option value="other">Annat</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Datum *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Starttid *</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endTime">Sluttid *</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Beskrivning</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Lägg till eventuella anteckningar..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
                  Avbryt
                </button>
                <button type="submit" className="btn-submit">
                  Lägg till
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { MonthCalendar };
