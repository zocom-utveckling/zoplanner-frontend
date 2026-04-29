import { useState, useEffect, useMemo } from "react";
import { useConsultantMatching } from "../hooks/useConsultantMatching";
import { useConsultantSchedule } from "../hooks/useConsultantSchedule";
import { useSessionEditor } from "../hooks/useSessionEditor";
import { useAssignmentPublishFlow } from "../hooks/useAssignmentPublishFlow";
import { usePlannerEventClick } from "../hooks/usePlannerEventClick";
import { useDraftRelationSync } from "../hooks/useDraftRelationSync";
import PlannerPlanningPanel from "./PlannerPlanningPanel";
import PlannerMatchingPanel from "./PlannerMatchingPanel";
import { notificationService } from "@zoplanner/api";
import {
  PlannerMonthView,
  CourseSummary,
  SessionModal,
  upsertPlanningDraft,
  toPlanningDraftFromAssignment,
  getCourseName,
  getEndDate,
  getSessionTitle,
  getStartDate,
} from "@zoplanner/planning-tool";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { buildScheduleSummary } from "../utils/scheduleSummary.helpers";
import { exportSchedulePdf } from "../utils/exportSchedulePdf";

export function PlannerWorkspace({
  managerId,
  plannerMode,
  setPlannerMode,
  selectedAssignmentForMatching,
  clearSelectedAssignmentForMatching,
}) {
  const [showBasicInfo, setShowBasicInfo] = useState(true);
  const [showScheduleEditor, setShowScheduleEditor] = useState(true);
  const [focusDate, setFocusDate] = useState(new Date());
  const [courseDraft, setCourseDraft] = useState(null);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const { consultants, loading: consultantsLoading } = useConsultantMatching();

  const {
    consultantAssignmentEvents,
    setConsultantAssignmentEvents,
    consultantActivities,
    setConsultantActivities,
    isLoadingConsultantSchedule,
    consultantActivityEvents,
  } = useConsultantSchedule(selectedConsultant);

  const {
    isModalOpen,
    formData,
    handleSessionClick,
    handleSessionFormChange,
    handleSessionSubmit,
    handleSessionModalClose,
    handleEventDrop,
  } = useSessionEditor({
    courseDraft,
    setCourseDraft,
    selectedConsultant,
    setConsultantActivities,
  });

  const { handleEventClick } = usePlannerEventClick({
    handleSessionClick,
    consultantActivities,
    setConsultantActivities,
  });

  const { isPreparingDraft, prepareDraftRelations } = useDraftRelationSync();

  const { isSaving, handleAssignConsultant, handlePublishDraft } =
    useAssignmentPublishFlow({
      managerId,
      courseDraft,
      setActiveAssignment,
      setCourseDraft,
      setPlannerMode,
    });

  async function handleSavePlanningDraft(draft) {
    const preparedDraft = await prepareDraftRelations(
      draft,
      managerId,
      courseDraft,
    );

    if (!preparedDraft) {
      return;
    }

    setActiveAssignment(null);
    setSelectedConsultant(null);
    setCourseDraft(preparedDraft);
    setShowScheduleEditor(false);
    setIsEditingBasicInfo(false);
  }

  useEffect(() => {
    if (!courseDraft) return;
    upsertPlanningDraft(courseDraft);
  }, [courseDraft]);

  useEffect(() => {
    if (!selectedAssignmentForMatching) return;

    const normalizedStartDate = getStartDate(selectedAssignmentForMatching);
    const normalizedEndDate = getEndDate(selectedAssignmentForMatching);

    setCourseDraft(
      toPlanningDraftFromAssignment(selectedAssignmentForMatching),
    );

    setActiveAssignment({
      ...selectedAssignmentForMatching,
      dateStart: normalizedStartDate,
      dateEnd: normalizedEndDate,
      course: {
        name: getCourseName(selectedAssignmentForMatching, "Kursschema"),
      },
      sessions: selectedAssignmentForMatching.sessions ?? [],
    });
  }, [selectedAssignmentForMatching]);

  const hasUnsavedPlanning = Boolean(courseDraft) && !isSaving;

  useEffect(() => {
    function handleBeforeUnload(event) {
      if (!hasUnsavedPlanning) return;

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedPlanning]);

  const assignmentView = activeAssignment?.consultantId
    ? activeAssignment
    : (courseDraft ?? activeAssignment);

  const calendarSource = assignmentView?.sessionsDraft?.length
    ? assignmentView
    : assignmentView
      ? {
          startDate: getStartDate(assignmentView),
          endDate: getEndDate(assignmentView),
          sessionsDraft: assignmentView.sessions ?? [],
        }
      : assignmentView;

  const calendarGridDays = useMemo(() => {
    if (calendarSource?.startDate && calendarSource?.endDate) {
      const [sy, sm, sd] = calendarSource.startDate.split("-").map(Number);
      const [ey, em, ed] = calendarSource.endDate.split("-").map(Number);

      const start = startOfWeek(new Date(sy, sm - 1, sd), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(new Date(ey, em - 1, ed)), {
        weekStartsOn: 1,
      });

      return eachDayOfInterval({ start, end });
    }

    const start = startOfWeek(startOfMonth(focusDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(focusDate), { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end });
  }, [focusDate, calendarSource]);

  const assignmentEvents = useMemo(() => {
    if (!calendarSource?.sessionsDraft?.length) return [];

    return calendarSource.sessionsDraft.map((session, index) => ({
      id: `assignment-${index + 1}`,
      sessionIndex: index,
      title: getSessionTitle(session, index),
      type: "assignment-session",
      start: new Date(session.timeStart),
      end: new Date(session.timeEnd),
      draggable: true,
    }));
  }, [calendarSource]);

  const events = useMemo(
    () => [
      ...assignmentEvents,
      ...consultantActivityEvents,
      ...consultantAssignmentEvents,
    ],
    [assignmentEvents, consultantActivityEvents, consultantAssignmentEvents],
  );

  const summaryAssignment = assignmentView
    ? {
        dateStart: getStartDate(assignmentView),
        dateEnd: getEndDate(assignmentView),
        course: {
          name: getCourseName(assignmentView, "Kursschema"),
        },
        sessions:
          assignmentView?.sessions ?? assignmentView?.sessionsDraft ?? [],
      }
    : null;

  const sidebarTitle = getCourseName(assignmentView, "Ny planering");

  const plannerModeLabel =
    plannerMode === "planning" ? "Planering" : "Matchning";

  const focusMonthLabel = focusDate
    .toLocaleDateString("sv-SE", {
      month: "long",
      year: "numeric",
    })
    .replace(/^./, (char) => char.toUpperCase());

  const assignedConsultantName = assignmentView?.consultant?.name || "";
  const isAssigned = Number(assignmentView?.consultantId) > 0;

  const scheduleSummary = buildScheduleSummary(
    assignmentView?.sessions ?? assignmentView?.sessionsDraft ?? [],
  );

  const isDraftValue = (value) => {
    const normalized = String(value ?? "")
      .trim()
      .toUpperCase();
    return !normalized || normalized.startsWith("UTKAST");
  };

  const isDraftCourse =
    Boolean(courseDraft?.isDraftCourse) ||
    isDraftValue(courseDraft?.courseName);

  const isDraftCustomer =
    Boolean(courseDraft?.isDraftCustomer) ||
    Boolean(courseDraft?.isDraftCustomerEntity) ||
    isDraftValue(courseDraft?.customerName);

  const isDraftClass =
    Boolean(courseDraft?.isDraftClass) ||
    Boolean(courseDraft?.isDraftClassEntity) ||
    isDraftValue(courseDraft?.className);

  const missingFinalInfo = [];
  if (isDraftCustomer) missingFinalInfo.push("kund");
  if (isDraftClass) missingFinalInfo.push("klass");
  if (isDraftCourse) missingFinalInfo.push("kursnamn");

  console.log("summaryAssignment", summaryAssignment);
  console.log("activeAssignment", activeAssignment);
  console.log("selectedConsultant", selectedConsultant);
  console.log("isAssigned", isAssigned);

  return (
    <div className="planner-workspace">
      <div className="planner-workspace__header">
        <h1>Planera</h1>
        <div className="planner-workspace__header-meta">
          <span className="planner-workspace__header-mode">
            {plannerModeLabel}
          </span>
          <span className="planner-workspace__header-month">
            {focusMonthLabel}
          </span>
        </div>
      </div>

      <div className="planner-workspace__content">
        <div className="planner-workspace__layout">
          <aside className="planner-workspace__sidebar">
            <section className="planner-workspace__panel planner-workspace__panel--form">
              {plannerMode === "planning" && <h2>{sidebarTitle}</h2>}

              {plannerMode === "planning" ? (
                <PlannerPlanningPanel
                  courseDraft={courseDraft}
                  selectedAssignmentForMatching={selectedAssignmentForMatching}
                  isEditingBasicInfo={isEditingBasicInfo}
                  showBasicInfo={showBasicInfo}
                  showScheduleEditor={showScheduleEditor}
                  setIsEditingBasicInfo={setIsEditingBasicInfo}
                  setShowScheduleEditor={setShowScheduleEditor}
                  setShowBasicInfo={setShowBasicInfo}
                  setPlannerMode={setPlannerMode}
                  setActiveAssignment={setActiveAssignment}
                  setSelectedConsultant={setSelectedConsultant}
                  onSaveDraft={handleSavePlanningDraft}
                  isSaving={isSaving || isPreparingDraft}
                />
              ) : (
                <PlannerMatchingPanel
                  consultantsLoading={consultantsLoading}
                  isAssigned={isAssigned}
                  isLoadingConsultantSchedule={isLoadingConsultantSchedule}
                  selectedConsultant={selectedConsultant}
                  missingFinalInfo={missingFinalInfo}
                  setPlannerMode={setPlannerMode}
                  courseDraft={courseDraft}
                  consultants={consultants}
                  onSelectConsultant={(consultant) => {
                    console.log("SELECTED CONSULTANT:", consultant);
                    setSelectedConsultant(consultant);
                  }}
                  onBack={() => {
                    setPlannerMode("planning");
                    setSelectedConsultant(null);
                    setConsultantAssignmentEvents([]);
                    setShowBasicInfo(true);
                    setShowScheduleEditor(false);
                    setIsEditingBasicInfo(false);
                  }}
                  onEditFromFinal={() => {
                    setActiveAssignment(null);
                    setShowBasicInfo(true);
                    setShowScheduleEditor(false);
                    setIsEditingBasicInfo(false);
                  }}
                  onFillInDetails={() => {
                    setPlannerMode("planning");
                    setSelectedConsultant(null);
                    setConsultantAssignmentEvents([]);
                    setShowBasicInfo(true);
                    setShowScheduleEditor(false);
                    setIsEditingBasicInfo(true);
                  }}
                  onConfirmConsultant={async (consultant) => {
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
                  }}
                  assignedConsultantName={assignedConsultantName}
                  scheduleSummary={scheduleSummary}
                  onExportPdf={() =>
                    exportSchedulePdf({
                      ...courseDraft,
                      sessions:
                        activeAssignment?.sessions ??
                        courseDraft?.sessionsDraft ??
                        [],
                      sessionsDraft:
                        courseDraft?.sessionsDraft ??
                        activeAssignment?.sessions ??
                        [],
                      customerName: courseDraft?.customerName,
                      courseName: courseDraft?.courseName,
                      className: courseDraft?.className,
                    })
                  }
                  onSendMessage={async () => {
                    try {
                      const recipientEmail = selectedConsultant?.email;

                      console.log("recipientEmail", recipientEmail);

                      if (!recipientEmail) {
                        console.error("No consultant email found");
                        return;
                      }

                      const result =
                        await notificationService.sendDirectMessage({
                          recipientEmail,
                          subject: "Nytt uppdrag",
                          message: `Du har fått ett nytt uppdrag:\n\n${getCourseName(
                            courseDraft,
                            "Kursschema",
                          )}\n${getStartDate(courseDraft)} - ${getEndDate(
                            courseDraft,
                          )}`,
                        });

                      console.log("Message sent", result);
                    } catch (error) {
                      console.error("Failed to send message", error);
                    }
                  }}
                />
              )}
            </section>

            {plannerMode === "planning" && summaryAssignment && !isAssigned ? (
              <section className="planner-workspace__panel">
                <CourseSummary
                  assignment={summaryAssignment}
                  onDelete={() => {
                    setCourseDraft(null);
                    setActiveAssignment(null);
                    setSelectedConsultant(null);
                    setConsultantAssignmentEvents([]);
                    setPlannerMode("planning");
                    clearSelectedAssignmentForMatching?.();
                  }}
                />
              </section>
            ) : null}
          </aside>

          <main className="planner-workspace__main">
            <PlannerMonthView
              monthGridDays={calendarGridDays}
              focusDate={focusDate}
              events={events}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
            />
          </main>
        </div>

        <SessionModal
          isOpen={isModalOpen}
          onClose={handleSessionModalClose}
          formData={formData}
          onChange={handleSessionFormChange}
          onSubmit={handleSessionSubmit}
        />
      </div>
    </div>
  );
}
