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
      body: JSON.stringify({ RecipientEmail, Message,Subject,EventType:"DIRECT-MESSAGE" }),
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

const sendNewAssignmentNotification = async ({ teacherEmail,teacherName, assignmentDescription,assignmentDueDate }) => {
    try {
        if (!teacherEmail || !teacherName || !assignmentDescription || !assignmentDueDate) {
            throw new Error("All fields are required");
        }
        const res = await fetch("http://localhost:5027/api/Notification/send-new-assignment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({  teacherEmail, teacherName, assignmentDescription, assignmentDueDate, eventType:"NEW_ASSIGNMENT" }),
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
  const sendScheduleUpdated = async ({ teacherEmail, message }) => {
    try {
      if (!teacherEmail || !message) {
        throw new Error("Email and message are required");
      }
      const res = await fetch("http://localhost:5027/api/Notification/send-schedule-updated", {
        method: "POST",     
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacherEmail, message, EventType:"SCHEDULE-UPDATED" }),
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
        body: JSON.stringify({ TeacherEmail, TeacherName, MonthTitle,WeekRange, EventType:"SCHEDULE-CALENDAR" }),
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



  
