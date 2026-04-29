import { useState } from "react";
import "./index.css";

function MonthCalendar({ variant = "sidebar", onSubmit }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
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

    setSubmitError("");

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
    if (isSubmitting) return;
    setSubmitError("");
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setIsSubmitting(true);

    const normalizedFormData = {
      ...formData,
      title: formData?.title?.trim() || "Aktivitet",
    };

    try {
      if (onSubmit) {
        const wasSaved = await onSubmit(normalizedFormData);
        if (wasSaved === false) {
          setSubmitError("Kunde inte spara aktivitet i databasen.");
          return;
        }
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
    } catch {
      setSubmitError("Kunde inte spara aktivitet i databasen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = getDaysInMonth();

  return (
    <div
      className={`month-calendar ${variant === "sidebar" ? "month-calendar--sidebar" : "month-calendar--page"}`}
    >
      <div className="month-calendar__header">
        <button className="month-calendar__nav-btn" onClick={prevMonth}>
          {"<"}
        </button>
        <span className="month-calendar__section-title">Månad</span>
        <button className="month-calendar__nav-btn" onClick={nextMonth}>
          {">"}
        </button>
      </div>

      <div className="month-calendar__display">
        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </div>

      <div className="month-calendar__grid">
        {weekDays.map((day, index) => (
          <div key={index} className="month-calendar__weekday">
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <div
            key={`day-${index}`}
            className={`month-calendar__day ${day ? "" : "month-calendar__day--empty"} ${isToday(day) ? "month-calendar__day--today" : ""} ${day ? "month-calendar__day--clickable" : ""}`}
            onClick={() => handleDayClick(day)}
          >
            {day || ""}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="month-calendar-modal" onClick={handleCloseModal}>
          <div
            className="month-calendar-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="month-calendar-modal__header">
              <h2>Lägg till aktivitet</h2>
              <button
                className="month-calendar-modal__close-btn"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="month-calendar-modal__form"
            >
              <div className="month-calendar-modal__field-group">
                <label htmlFor="title">Titel</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="T.ex. Möte med kursledare"
                />
              </div>

              <div className="month-calendar-modal__field-group">
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

              <div className="month-calendar-modal__field-group">
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

              <div className="month-calendar-modal__row">
                <div className="month-calendar-modal__field-group">
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

                <div className="month-calendar-modal__field-group">
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

              <div className="month-calendar-modal__field-group">
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

              <div className="month-calendar-modal__actions">
                <button
                  type="button"
                  className="month-calendar-modal__cancel-btn"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="month-calendar-modal__submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sparar..." : "Lägg till"}
                </button>
              </div>

              {submitError ? (
                <p className="month-calendar-modal__error" role="alert">
                  {submitError}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { MonthCalendar };
