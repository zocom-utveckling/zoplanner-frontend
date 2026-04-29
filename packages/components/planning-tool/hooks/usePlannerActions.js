import { notificationService } from "@zoplanner/api";
import { exportSchedulePdf } from "../utils/exportSchedulePdf";
import {
  getClassName,
  getCourseName,
  getEndDate,
  getStartDate,
} from "@zoplanner/planning-tool";

export function usePlannerActions({
  activeAssignment,
  courseDraft,
  selectedConsultant,
  setSelectedConsultant,
  handlePublishDraft,
  handleAssignConsultant,
}) {
  async function handleConfirmConsultant(consultant) {
    console.log("🔥 ON CONFIRM CONSULTANT", consultant);

    setSelectedConsultant(consultant);

    let assignment = activeAssignment;

    if (!assignment?.id) {
      console.log("⚠️ No assignment id → publishing");
      assignment = await handlePublishDraft();
      console.log("📦 AFTER PUBLISH", assignment);
    }

    if (!assignment?.id) {
      console.error("❌ No assignment id after publish");
      return;
    }

    await handleAssignConsultant(assignment, consultant);
  }

  function handleExportPdf() {
    exportSchedulePdf({
      ...courseDraft,
      sessions:
        activeAssignment?.sessions ?? courseDraft?.sessionsDraft ?? [],
      sessionsDraft:
        courseDraft?.sessionsDraft ?? activeAssignment?.sessions ?? [],
      customerName: courseDraft?.customerName,
      courseName: getCourseName(courseDraft, "Kursschema"),
      className: getClassName(courseDraft),
    });
  }

  async function handleSendMessage() {
    try {
      const recipientEmail = selectedConsultant?.email;

      console.log("recipientEmail", recipientEmail);

      if (!recipientEmail) {
        console.error("No consultant email found");
        return;
      }

      const result = await notificationService.sendDirectMessage({
        recipientEmail,
        subject: "Nytt uppdrag",
        message: `Du har fått ett nytt uppdrag:\n\n${getCourseName(
          courseDraft,
          "Kursschema",
        )}\n${getStartDate(courseDraft)} - ${getEndDate(courseDraft)}`,
      });

      console.log("Message sent", result);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  }

  return {
    handleConfirmConsultant,
    handleExportPdf,
    handleSendMessage,
  };
}