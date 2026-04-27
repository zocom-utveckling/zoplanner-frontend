export function createNotificationService(api) {
  return {
    sendDirectMessage: async ({ recipientEmail, message, subject }) => {
      if (!recipientEmail || !message) {
        throw new Error("Email and message are required");
      }

      return api.post("/Notification/send-direct-message", {
        RecipientEmail: recipientEmail,
        Message: message,
        Subject: subject,
        EventType: "DIRECT_MESSAGE",
      });
    },

    sendNewAssignment: async ({
      teacherEmail,
      teacherName,
      assignmentDescription,
      assignmentDueDate,
    }) => {
      if (
        !teacherEmail ||
        !teacherName ||
        !assignmentDescription ||
        !assignmentDueDate
      ) {
        throw new Error("All fields are required");
      }

      return api.post("/Notification/send-new-assignment", {
        teacherEmail,
        teacherName,
        assignmentDescription,
        assignmentDueDate,
        eventType: "NEW_ASSIGNMENT",
      });
    },

    sendScheduleUpdated: async ({ teacherEmail, message }) => {
      if (!teacherEmail || !message) {
        throw new Error("Email and message are required");
      }

      return api.post("/Notification/send-schedule-updated", {
        teacherEmail,
        message,
        eventType: "SCHEDULE_UPDATED",
      });
    },

    sendScheduleCalendar: async ({
      teacherEmail,
      teacherName,
      monthTitle,
      weekRange,
      days,
    }) => {
      if (!teacherEmail || !teacherName || !monthTitle || !weekRange || !days) {
        throw new Error("Schedule calendar fields are required");
      }

      return api.post("/Notification/send-schedule-calendar", {
        TeacherEmail: teacherEmail,
        TeacherName: teacherName,
        MonthTitle: monthTitle,
        WeekRange: weekRange,
        Days: days,
        EventType: "SCHEDULE_CALENDAR",
      });
    },
  };
}