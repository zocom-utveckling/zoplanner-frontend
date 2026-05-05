import { notificationService } from "@zoplanner/api";

const SendDirectMessage = async ({ RecipientEmail, Message, Subject }) => {
  try {
    if (!RecipientEmail || !Message || !Subject) {
      throw new Error("Email and message are required");
    }
    return await notificationService.sendDirectMessage({
      recipientEmail: RecipientEmail,
      message: Message,
      subject: Subject,
    });
  } catch (error) {
    console.log("validation error:", error.message);
    throw error;
  }
};

const sendNewAssignmentNotification = async ({
  teacherEmail,
  teacherName,
  assignmentDescription,
  assignmentDueDate,
  assignmentId,
  timestamp,
}) => {
  try {
    return await notificationService.sendNewAssignment({
      teacherEmail,
      teacherName,
      assignmentDescription,
      assignmentDueDate,
      assignmentId,
      timestamp,
    });
  } catch (error) {
    console.log("validation error:", error.message);
    throw error;
  }
};

const sendScheduleUpdated = async ({
  message,
  teacherEmail,
  eventTime,
  recipient,
  subject,
}) => {
  try {
    if (!recipient || !message) {
      throw new Error("Email and message are required");
    }
    return await notificationService.sendScheduleUpdated({
      teacherEmail,
      message,
      recipient,
      subject,
      eventTime,
    });
  } catch (error) {
    console.log("validation error:", error.message);
    throw error;
  }
};

const sendScheduleCalendar = async ({
  TeacherEmail,
  TeacherName,
  MonthTitle,
  WeekRange,
  Days,
}) => {
  try {
    return await notificationService.sendScheduleCalendar({
      teacherEmail: TeacherEmail,
      teacherName: TeacherName,
      monthTitle: MonthTitle,
      weekRange: WeekRange,
      days: Days,
    });
  } catch (error) {
    console.log("validation error:", error.message);
    throw error;
  }
};

export {
  sendNewAssignmentNotification,
  SendDirectMessage,
  sendScheduleUpdated,
  sendScheduleCalendar,
};