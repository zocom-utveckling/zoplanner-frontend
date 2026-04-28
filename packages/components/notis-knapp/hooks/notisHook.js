const SendDirectMessage= async({RecipientEmail,Message,Subject})=>{
try{
    if(!RecipientEmail || !Message) {
  throw new Error("Email and message are required");
}
    const res = await fetch("http://localhost:5027/api/Notification/send-direct-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ RecipientEmail, Message,Subject:"Study",EventType:"DIRECT_MESSAGE" }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send direct message");
    }
    return data;
}catch(error){
    console.log("validation error:", error.message);
    throw error;
}


  }

const sendNewAssignmentNotification = async ({ teacherEmail,teacherName, assignmentDescription,assignmentDueDate,assignmentId }) => {
    try {
        if (!teacherEmail || !teacherName || !assignmentDescription || !assignmentDueDate) {
            throw new Error("All fields are required");
        }
        const res = await fetch("http://localhost:5027/api/Notification/send-new-assignment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({  teacherEmail, teacherName, assignmentDescription, assignmentDueDate,assignmentId, timestamp:"2026-04-12T13:00:00.000Z", eventType:"NEW_ASSIGNMENT" }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "Failed to send assignment notification");
        }
        return data;
    
    } catch (error) {
      console.log("validation error:", error.message);
      throw error;
    }
  };
  const sendScheduleUpdated = async ({  message,email }) => {
    try {
      if (!email || !message) {
        throw new Error("Email and message are required");
      }
      const res = await fetch("http://localhost:5027/api/Notification/send-schedule-updated", {
        method: "POST",     
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
  eventType: "SCHEDULE_UPDATED",
  recipient:email,
  teacherEmail: email,
  subject: "Schedule update – week 12",
  message,
  eventTime: "2026-03-15T09:00:00.000Z",
 
 
} ),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send schedule update notification");
      }
      return data;
    } catch (error) {
      console.log("validation error:", error.message);
      throw error;
    }
  }
  const sendScheduleCalendar = async ({ TeacherEmail,TeacherName,MonthTitle,WeekRange,Days }) => {
    try {
      if (!TeacherEmail || !TeacherName || !MonthTitle || !WeekRange || !Days) {
        throw new Error("Email and message are required");
      }
      const res = await fetch("http://localhost:5027/api/Notification/send-schedule-calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ TeacherEmail, TeacherName, MonthTitle,WeekRange,Days, EventType:"SCHEDULE_CALENDAR" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send schedule calendar notification");
      }
      return data;
    } catch (error) {
      console.log("validation error:", error.message);
      throw error;
    }
  }
  export {sendNewAssignmentNotification,SendDirectMessage,sendScheduleUpdated,sendScheduleCalendar}



  
