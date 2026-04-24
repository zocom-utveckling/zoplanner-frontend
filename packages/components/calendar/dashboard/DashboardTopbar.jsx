import "./DashboardTopbar.css";
import { memo } from "react";

function DashboardTopbar({
  title,
  view,
  setView,
  onGoToday,
  onPrev,
  onNext,
  bookingWeekColors,
  onToggleBookingWeekColors,
  calendarUser,
  managerUser,
}) {
  return (
    <>
      {calendarUser && managerUser && calendarUser.id !== managerUser.id && (
        <div className="calendar-user-name">{calendarUser.name}</div>
      )}
      <div className="topbar topbar--dashboard">
        <div className="title-with-nav">
          <button className="nav-btn" onClick={onPrev}>
            ←
          </button>
          <div className="title">{title}</div>
          <button className="nav-btn" onClick={onNext}>
            →
          </button>
        </div>

        <div className="controls controls--dashboard">
          <label className="toggle-label" title="Visa bokningar i veckofärger">
            <span className="toggle-text">Veckofärger</span>
            <span
              className={`toggle-track ${bookingWeekColors ? "toggle-track--on" : ""}`}
            >
              <span className="toggle-thumb" />
            </span>
            <input
              type="checkbox"
              className="toggle-input"
              checked={bookingWeekColors}
              onChange={onToggleBookingWeekColors}
            />
          </label>
          <button className="small-btn" onClick={onGoToday}>
            Idag
          </button>

          <div className="segment">
            <button
              className={`segment-btn ${view === "week" ? "segment-active" : ""}`}
              onClick={() => setView("week")}
            >
              Veckovy
            </button>
            <button
              className={`segment-btn ${view === "month" ? "segment-active" : ""}`}
              onClick={() => setView("month")}
            >
              Månadsvy
            </button>
          </div>

          <input className="search" placeholder="Sök..." />
        </div>
      </div>
    </>
  );
}

export default memo(DashboardTopbar);
