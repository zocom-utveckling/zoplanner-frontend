import React from "react";

export default function Topbar({
  title,
  view,
  setView,
  onGoToday,
  onPrev,
  onNext,
}) {
  return (
    <div className="topbar">
      <div className="title-with-nav">
        <button className="nav-btn" onClick={onPrev}>
          ←
        </button>
        <div className="title">{title}</div>
        <button className="nav-btn" onClick={onNext}>
          →
        </button>
      </div>

      <div className="controls">
        <button className="small-btn" onClick={onGoToday}>
          Idag
        </button>
        <div className="segment">
          <button
            className={`segment-btn ${view === "day" ? "segment-active" : ""}`}
            onClick={() => setView("day")}
          >
            Dagsvy
          </button>
          <button
            className={`segment-btn ${view === "week" ? "segment-active" : ""}`}
            onClick={() => setView("week")}
          >
            Veckovy
          </button>
          <button
            className={`segment-btn ${
              view === "month" ? "segment-active" : ""
            }`}
            onClick={() => setView("month")}
          >
            Månadsvy
          </button>
        </div>

        <input className="search" placeholder="Sök..." />
      </div>
    </div>
  );
}
