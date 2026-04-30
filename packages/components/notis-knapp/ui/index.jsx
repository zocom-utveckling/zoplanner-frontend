import { useState } from "react";
import "./index.css";
import {
  sendNewAssignmentNotification,
  SendDirectMessage,
  sendScheduleCalendar,
  sendScheduleUpdated,
} from "../hooks/notisHook";

function SendAssignmentNotification() {
  const [assignmentForm, setAssignmentForm] = useState({
    teacherEmail: "",
    teacherName: "",
    assignmentDescription: "",
    assignmentId: "",
  });

  const [directMessageForm, setDirectMessageForm] = useState({
    RecipientEmail: "",
    Message: "",
    Subject: "",
  });

  const [scheduleUpdatedForm, setScheduleUpdatedForm] = useState({
    recipient: "",
    message: "",
    subject: "",
  });

  const [scheduleCalendarForm, setScheduleCalendarForm] = useState({
    TeacherEmail: "",
    TeacherName: "",
    MonthTitle: "",
    WeekRange: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
  };

  const handleSendAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.teacherEmail || !assignmentForm.teacherName || !assignmentForm.assignmentDescription) {
      showFeedback("error", "Alla fält är obligatoriska");
      return;
    }

    setLoading(true);
    try {
      const data = await sendNewAssignmentNotification({
        ...assignmentForm,
        assignmentDueDate: "2026-05-15T17:00:00.000Z",
        timestamp: "2026-04-12T13:00:00.000Z",
      });
      showFeedback("success", data.message);
      setAssignmentForm({ teacherEmail: "", teacherName: "", assignmentDescription: "", assignmentId: "" });
    } catch (error) {
      showFeedback("error", error.message || "Kunde inte skicka uppdragsavisering");
    } finally {
      setLoading(false);
    }
  };

  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!directMessageForm.RecipientEmail || !directMessageForm.Message || !directMessageForm.Subject) {
      showFeedback("error", "Alla fält är obligatoriska");
      return;
    }

    setLoading(true);
    try {
      const data = await SendDirectMessage(directMessageForm);
      showFeedback("success", data.message);
      setDirectMessageForm({ RecipientEmail: "", Message: "", Subject: "" });
    } catch (error) {
      showFeedback("error", error.message || "Kunde inte skicka direkt meddelande");
    } finally {
      setLoading(false);
    }
  };

  const handleSendScheduleUpdated = async (e) => {
    e.preventDefault();
    if (!scheduleUpdatedForm.recipient || !scheduleUpdatedForm.message) {
      showFeedback("error", "Alla fält är obligatoriska");
      return;
    }

    setLoading(true);
    try {
      const data = await sendScheduleUpdated({
        recipient: scheduleUpdatedForm.recipient,
        message: scheduleUpdatedForm.message,
        teacherEmail: scheduleUpdatedForm.recipient,
        subject: scheduleUpdatedForm.subject || "Schedule update – week 12",
        eventTime: "2026-03-15T09:00:00.000Z",
      });
      showFeedback("success", data.message);
      setScheduleUpdatedForm({ recipient: "", message: "", subject: "" });
    } catch (error) {
      showFeedback("error", error.message || "Kunde inte skicka schemauppdatering");
    } finally {
      setLoading(false);
    }
  };

  const handleSendScheduleCalendar = async (e) => {
    e.preventDefault();
    if (!scheduleCalendarForm.TeacherEmail || !scheduleCalendarForm.TeacherName || !scheduleCalendarForm.MonthTitle || !scheduleCalendarForm.WeekRange) {
      showFeedback("error", "Alla fält är obligatoriska");
      return;
    }

    setLoading(true);
    try {
      const data = await sendScheduleCalendar({
        ...scheduleCalendarForm,
        Days: [{ DayNumber: "1", ContentHtml: "<div>Morning session</div>" }],
      });
      showFeedback("success", data.message);
      setScheduleCalendarForm({ TeacherEmail: "", TeacherName: "", MonthTitle: "", WeekRange: "" });
    } catch (error) {
      showFeedback("error", error.message || "Kunde inte skicka kalenderavisering");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notis-knapp-sections">
      {feedback.message && (
        <div className={`notis-feedback notis-feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <section className="notis-section">
        <h3>Skicka ny uppdrag</h3>
        <form onSubmit={handleSendAssignment} className="notis-form">
          <input
            type="email"
            placeholder="Lärares e-postadress"
            value={assignmentForm.teacherEmail}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, teacherEmail: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Lärares namn"
            value={assignmentForm.teacherName}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, teacherName: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Uppdragsbeskrivning"
            value={assignmentForm.assignmentDescription}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentDescription: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Uppdrag ID (optional)"
            value={assignmentForm.assignmentId}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentId: e.target.value })}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Skickar..." : "Skicka uppdrag"}
          </button>
        </form>
      </section>

      <section className="notis-section">
        <h3>Skicka direkt meddelande</h3>
        <form onSubmit={handleSendDirectMessage} className="notis-form">
          <input
            type="email"
            placeholder="Mottagarens e-postadress"
            value={directMessageForm.RecipientEmail}
            onChange={(e) => setDirectMessageForm({ ...directMessageForm, RecipientEmail: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Ämne"
            value={directMessageForm.Subject}
            onChange={(e) => setDirectMessageForm({ ...directMessageForm, Subject: e.target.value })}
            disabled={loading}
          />
          <textarea
            placeholder="Meddelande"
            value={directMessageForm.Message}
            onChange={(e) => setDirectMessageForm({ ...directMessageForm, Message: e.target.value })}
            disabled={loading}
            rows={3}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Skickar..." : "Skicka meddelande"}
          </button>
        </form>
      </section>

      <section className="notis-section">
        <h3>Skicka schemauppdatering</h3>
        <form onSubmit={handleSendScheduleUpdated} className="notis-form">
          <input
            type="email"
            placeholder="Mottagarens e-postadress"
            value={scheduleUpdatedForm.recipient}
            onChange={(e) => setScheduleUpdatedForm({ ...scheduleUpdatedForm, recipient: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Ämne (optional)"
            value={scheduleUpdatedForm.subject}
            onChange={(e) => setScheduleUpdatedForm({ ...scheduleUpdatedForm, subject: e.target.value })}
            disabled={loading}
          />
          <textarea
            placeholder="Meddelande"
            value={scheduleUpdatedForm.message}
            onChange={(e) => setScheduleUpdatedForm({ ...scheduleUpdatedForm, message: e.target.value })}
            disabled={loading}
            rows={3}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Skickar..." : "Skicka schemauppdatering"}
          </button>
        </form>
      </section>

      <section className="notis-section">
        <h3>Skicka schemakalender</h3>
        <form onSubmit={handleSendScheduleCalendar} className="notis-form">
          <input
            type="email"
            placeholder="Lärares e-postadress"
            value={scheduleCalendarForm.TeacherEmail}
            onChange={(e) => setScheduleCalendarForm({ ...scheduleCalendarForm, TeacherEmail: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Lärares namn"
            value={scheduleCalendarForm.TeacherName}
            onChange={(e) => setScheduleCalendarForm({ ...scheduleCalendarForm, TeacherName: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Månad titel (t.ex. Mars 2026)"
            value={scheduleCalendarForm.MonthTitle}
            onChange={(e) => setScheduleCalendarForm({ ...scheduleCalendarForm, MonthTitle: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Veckoområde (t.ex. v.2-8)"
            value={scheduleCalendarForm.WeekRange}
            onChange={(e) => setScheduleCalendarForm({ ...scheduleCalendarForm, WeekRange: e.target.value })}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Skickar..." : "Skicka kalender"}
          </button>
        </form>
      </section>
    </div>
  );
}

export { SendAssignmentNotification };
