import "./DashboardTopbar.css";
import { memo, useState } from "react";
import QuickMessageModal from "./QuickMessageModal";

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
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  function handleSendQuickMessage(msg) {
    // Här kan du lägga till riktig API-anrop för att skicka meddelande
    setMessageSent(true);
    setTimeout(() => {
      setShowMessageModal(false);
      setMessageSent(false);
    }, 1200);
  }
  return (
    <>
      {calendarUser && managerUser && calendarUser.id !== managerUser.id && (
        <div className="dashboard-topbar__calendar-user-row">
          <span className="dashboard-topbar__calendar-user-name">
            {calendarUser.name}
          </span>
          <button
            className="dashboard-topbar__message-btn"
            title={`Skicka meddelande till ${calendarUser.name}`}
            onClick={() => setShowMessageModal(true)}
          >
            Skriv meddelande
          </button>
          <QuickMessageModal
            open={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            recipient={calendarUser}
            onSend={handleSendQuickMessage}
          />
          {messageSent && (
            <div style={{ color: "#2563eb", marginLeft: 12, fontWeight: 500 }}>
              Meddelande skickat!
            </div>
          )}
        </div>
      )}
      <div className="dashboard-topbar">
        <div className="dashboard-topbar__title-nav">
          <button className="dashboard-topbar__nav-btn" onClick={onPrev}>
            ←
          </button>
          <div className="dashboard-topbar__title">{title}</div>
          <button className="dashboard-topbar__nav-btn" onClick={onNext}>
            →
          </button>
        </div>

        <div className="dashboard-topbar__controls">
          <label
            className="dashboard-topbar__toggle-label"
            title="Visa bokningar i veckofärger"
          >
            <span className="dashboard-topbar__toggle-text">Veckofärger</span>
            <span
              className={`dashboard-topbar__toggle-track ${bookingWeekColors ? "dashboard-topbar__toggle-track--on" : ""}`}
            >
              <span className="dashboard-topbar__toggle-thumb" />
            </span>
            <input
              type="checkbox"
              className="dashboard-topbar__toggle-input"
              checked={bookingWeekColors}
              onChange={onToggleBookingWeekColors}
            />
          </label>
          <button className="dashboard-topbar__today-btn" onClick={onGoToday}>
            Idag
          </button>

          <div className="dashboard-topbar__segment">
            <button
              className={`dashboard-topbar__segment-btn ${view === "week" ? "dashboard-topbar__segment-btn--active" : ""}`}
              onClick={() => setView("week")}
            >
              Veckovy
            </button>
            <button
              className={`dashboard-topbar__segment-btn ${view === "month" ? "dashboard-topbar__segment-btn--active" : ""}`}
              onClick={() => setView("month")}
            >
              Månadsvy
            </button>
          </div>

          <input className="dashboard-topbar__search" placeholder="Sök..." />
        </div>
      </div>
    </>
  );
}

export default memo(DashboardTopbar);
