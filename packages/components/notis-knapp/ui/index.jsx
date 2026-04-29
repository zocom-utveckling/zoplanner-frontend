import "./index.css";
import {
  sendNewAssignmentNotification,
  SendDirectMessage,
  sendScheduleCalendar,
  sendScheduleUpdated,
} from "../hooks/notisHook";

function SendAssignmentNotification() {
  const handleSendAssignmentNotification = async () => {
    const email = prompt("Ange mottagarens e-postadress:");
    if (!email) {
      alert("E-postadress krävs");
      return;
    }

    try {
      const data = await sendNewAssignmentNotification({
        teacherEmail: email,
        teacherName: "Amir",
        assignmentDescription: "New assignment created",
        assignmentDueDate: "2026-05-15T17:00:00.000Z",
        assignmentId:"1",
        timestamp:"2026-04-12T13:00:00.000Z",
      });
      alert(data.message);
    } catch (error) {
      console.log("notification error:", error.message);
      alert(error.message || "Kunde inte skicka uppdragsavisering");
    }
  };

  const handleSendDirectMessage = async () => {
    const RecipientEmail = prompt("Ange mottagarens e-postadress:");
    const Message = prompt("Ange meddelandetext:");
    const Subject = prompt("Ange ämne:");
    if (!RecipientEmail || !Message || !Subject) {
      alert("E-postadress och meddelande krävs");
      return;
    }

    try {
      const data = await SendDirectMessage({ RecipientEmail, Message,Subject});
      alert(data.message);
    } catch (error) {
      console.log("notification error:", error.message);
      alert(error.message || "Kunde inte skicka direkt meddelande");
    }
  };

  const handleSendScheduleUpdated = async () => {
    const recipient = prompt("Ange mottagarens e-postadress:");
    if (!recipient) {
      alert("E-postadress krävs");
      return;
    }

    try {
      const data = await sendScheduleUpdated({
         recipient,
        message: "Your schedule has been updated.",
        
  teacherEmail: recipient,
  subject: "Schedule update – week 12",
  
  eventTime: "2026-03-15T09:00:00.000Z",
      });
      alert(data.message);
    } catch (error) {
      console.log("notification error:", error.message);
      alert(error.message || "Kunde inte skicka schemauppdatering");
    }
  };

  const handleSendScheduleCalendar = async () => {
    const email = prompt("Ange mottagarens e-postadress:");
    if (!email) {
      alert("E-postadress krävs");
      return;
    }

    try {
      const data = await sendScheduleCalendar({
        TeacherEmail: email,
        TeacherName: "Lärare-1",
        MonthTitle: "Mars 2026",
        WeekRange: "v.2-8",
        Days: [
          {
            DayNumber: "1",
            ContentHtml: "<div>Morning session</div>",
          },
        ],
      });
      alert(data.message);
    } catch (error) {
      console.log("notification error:", error.message);
      alert(error.message || "Kunde inte skicka kalenderavisering");
    }
  };

  return (
    <>
      <div className="notis-knapp">
        <button
          type="button"
          className="notis-knapp__action"
          onClick={handleSendDirectMessage}
        >
          Skicka direkt meddelande
        </button>
        <button
          type="button"
          className="notis-knapp__action"
          onClick={handleSendAssignmentNotification}
        >
          Skicka ny uppdrag
        </button>
        <button
          type="button"
          className="notis-knapp__action"
          onClick={handleSendScheduleUpdated}
        >
          Skicka schema uppdaterad
        </button>
        <button
          type="button"
          className="notis-knapp__action"
          onClick={handleSendScheduleCalendar}
        >
          Skicka Schema kalendar
        </button>
      </div>
    </>
  );
}

export { SendAssignmentNotification };
