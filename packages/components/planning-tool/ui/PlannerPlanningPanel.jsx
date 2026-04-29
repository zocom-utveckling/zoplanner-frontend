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
  onSaveDraft,
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
        onSave={onSaveDraft}
      />

      <button
        className="planner-planning-panel__action-btn"
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
