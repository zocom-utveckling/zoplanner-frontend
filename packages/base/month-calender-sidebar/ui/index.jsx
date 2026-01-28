import React, { useState } from "react";
import "./index.css";

function MonthCalendar({ variant = "sidebar" }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

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
            className={`calendar-day ${day ? "" : "empty"} ${isToday(day) ? "today" : ""}`}
          >
            {day || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export { MonthCalendar };
