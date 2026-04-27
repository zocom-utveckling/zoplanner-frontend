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
        <div className="calendar-user-name-with-btn">
          <span className="calendar-user-name">{calendarUser.name}</span>
          <button
            className="message-btn"
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
