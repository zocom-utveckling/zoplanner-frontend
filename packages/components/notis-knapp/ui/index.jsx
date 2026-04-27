import { useEffect, useState } from "react";
import "./index.css"
import { sendNewAssignmentNotification, SendDirectMessage, sendScheduleCalendar, sendScheduleUpdated } from "../hooks/notisHook";

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
        assignmentId:"1"
      });
      alert(data.message);
    } catch (error) {
      console.log("notification error:", error.message);
      alert(error.message || "Kunde inte skicka uppdragsavisering");
    }
  };

  const handleSendDirectMessage = async () => {
    const email = prompt("Ange mottagarens e-postadress:");
    const message = prompt("Ange meddelandetext:");
    if (!email || !message) {
      alert("E-postadress och meddelande krävs");
      return;
    }

    try {
      const data = await SendDirectMessage({ RecipientEmail: email, Message: message });
      alert(data.message);
    } catch (error) {
      console.log("notification error:", error.message);
      alert(error.message || "Kunde inte skicka direkt meddelande");
    }
  };

  const handleSendScheduleUpdated = async () => {
    const email = prompt("Ange mottagarens e-postadress:");
    if (!email) {
      alert("E-postadress krävs");
      return;
    }

    try {
      const data = await sendScheduleUpdated({
         email,
        message: "Your schedule has been updated.",
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
      <div className="notis-knapp-container">
        <button type="button" onClick={handleSendDirectMessage}>
          Skicka direkt meddelande
        </button>
        <button type="button" onClick={handleSendAssignmentNotification}>
          Skicka ny uppdrag
        </button>
        <button type="button" onClick={handleSendScheduleUpdated}>
          Skicka schema uppdaterad
        </button>
        <button type="button" onClick={handleSendScheduleCalendar}>
          Skicka Schema kalendar
        </button>
      </div>
    </>
  );
}

export { SendAssignmentNotification };
