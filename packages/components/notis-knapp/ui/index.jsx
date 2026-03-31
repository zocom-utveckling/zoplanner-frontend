import { useEffect, useState } from "react";
import "./index.css"


function SendAssignmentNotification() {
    async function sendAssignmentNotification() {
        const email= prompt("Ange mottagarens e-postadress:");
        if (!email) {
            alert("E-postadress krävs");
            return;
        }
  const notification = {
    
   eventType: "NEW_ASSIGNMENT",
    teacherEmail: email,
    
    assignmentDescription: "New assignment created",
    teacherName: "Lärare-1",
    assignmentDueDate: "2026-03-15T17:00:00.000Z"

  }

  const res = await fetch("http://localhost:5027/api/Notification/send-new-assignment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notification)
  })
const data = await res.json()
  if (!res.ok) {
    console.log("notification error:", data.message)
    return
  }
  
    alert(data.message)
  
}
async function sendDirektMessage() {
    const email= prompt("Ange mottagarens e-postadress:");
    const message = prompt("Ange meddelandetext:");
    if (!email || !message) {
        alert("E-postadress och meddelande krävs");
        return;
    }
    const notification = {
        EventType: "DIRECT_MESSAGE",
       RecipientEmail: email,
       Message: message,
        Subject: "Direkt meddelande från Zoplanner"
    }
    const res = await fetch("http://localhost:5027/api/Notification/send-direct-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notification)
  })
const data = await res.json()
  if (!res.ok) {
    console.log("notification error:", data.message)
    return
  }
  
    alert(data.message)
}
async function sendScheduleUpdated() {
    const email= prompt("Ange mottagarens e-postadress:");
    if (!email) {
        alert("E-postadress krävs");
        return;
    }
    const notification = {
       
  eventType: "SCHEDULE_UPDATED",
  
  teacherEmail: email,

  message: "Your schedule has been updated.",
  

    }
    const res = await fetch("http://localhost:5027/api/Notification/send-schedule-updated", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notification)
  })
const data = await res.json()
  if (!res.ok) {
    console.log("notification error:", data.message)
    return
  }
  
    alert(data.message)
}
async function sendScheduleCalendar() {
    const email= prompt("Ange mottagarens e-postadress:");
    if (!email) {
        alert("E-postadress krävs");
        return;
    }
    const notification = {
        EventType: "SCHEDULE_CALENDAR",
        teacherName: "Lärare-1",
        teacherEmail: email,
        monthTitle: "Mars 2026",
        weekRange: "v.2-8",
        days:[
            {
                DayNumber: "1",
                ContentHtml: "<div>Morning session</div>"

            }
        ]
    }
    const res = await fetch("http://localhost:5027/api/Notification/send-schedule-calendar", {  
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notification)
  })
const data = await res.json()
  if (!res.ok) {
    console.log("notification error:", data.message)
    return;
  }
  
    alert(data.message)
}

return(<>
<div className="notis-knapp-container">
    <button type="button" onClick={()=>sendDirektMessage()}>Skicka direkt meddelande</button>
    <button type="button" onClick={()=> sendAssignmentNotification()}>Skicka ny uppdrag</button>
    <button type="button" onClick={()=>sendScheduleUpdated()}>Skicka schema uppdaterad</button>
    <button type="button" onClick={()=>sendScheduleCalendar()}>Skicka Schema kalendar</button>
</div>

</>)

}



export { SendAssignmentNotification };

