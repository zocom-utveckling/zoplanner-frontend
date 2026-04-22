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
}) {
  return (
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

        <button
          className={`small-btn ${bookingWeekColors ? "small-btn--active" : ""}`}
          onClick={onToggleBookingWeekColors}
          title="Visa bokningar i veckofärger"
        >
          Veckofärger
        </button>

        <input className="search" placeholder="Sök..." />
      </div>
    </div>
  );
}

export default memo(DashboardTopbar);
