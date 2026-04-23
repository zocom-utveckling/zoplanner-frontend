import { CourseSetupForm } from "@zoplanner/planning-tool";

export default function PlannerPlanningPanel({
  courseDraft,
  selectedAssignmentForMatching,
  isEditingBasicInfo,
  showBasicInfo,
  showScheduleEditor,
  setIsEditingBasicInfo,
  setShowScheduleEditor,
  setShowBasicInfo,
  setPlannerMode,
  setActiveAssignment,
  setSelectedConsultant,
  setCourseDraft,
  isSaving,
}) {
  return (
    <>
      <CourseSetupForm
        initialValues={courseDraft}
        lockBasicInfo={
          Boolean(selectedAssignmentForMatching) && !isEditingBasicInfo
        }
        showBasicInfo={showBasicInfo}
        showScheduleEditor={showScheduleEditor}
        onEditBasicInfo={() => setIsEditingBasicInfo(true)}
        onEditSchedule={() => setShowScheduleEditor(true)}
        onSave={(draft) => {
          setActiveAssignment(null);
          setSelectedConsultant(null);
          setCourseDraft(draft);
          setShowScheduleEditor(false);
          setIsEditingBasicInfo(false);
        }}
      />

      <button
        className="planner-btn-primary"
        onClick={() => {
          console.log("🔘 primary click", courseDraft);

          if (!courseDraft?.sessionsDraft?.length) {
            console.log("📨 submitting form");
            document.querySelector(".course-setup-form")?.requestSubmit();
          } else {
            console.log("➡️ switching to matching");
            setShowScheduleEditor(false);
            setShowBasicInfo(true);
            setPlannerMode("matching");
          }
        }}
        disabled={isSaving}
      >
        {isSaving
          ? "Sparar..."
          : courseDraft?.sessionsDraft?.length
            ? "Hitta konsult"
            : "Visa upplägg"}
      </button>
    </>
  );
}
