import { useState, useEffect, useMemo } from "react";
import { useConsultantMatching } from "../hooks/useConsultantMatching";
import { useConsultantSchedule } from "../hooks/useConsultantSchedule";
import { useSessionEditor } from "../hooks/useSessionEditor";
import { useAssignmentPublishFlow } from "../hooks/useAssignmentPublishFlow";
import { usePlannerEventClick } from "../hooks/usePlannerEventClick";
import { useDraftRelationSync } from "../hooks/useDraftRelationSync";
import PlannerPlanningPanel from "./PlannerPlanningPanel";
import PlannerMatchingPanel from "./PlannerMatchingPanel";
import {
  PlannerMonthView,
  CourseSummary,
  SessionModal,
  upsertPlanningDraft,
  toPlanningDraftFromAssignment,
} from "@zoplanner/planning-tool";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { buildScheduleSummary } from "../utils/scheduleSummary.helpers";

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

    const normalizedStartDate =
      selectedAssignmentForMatching.startDate ??
      selectedAssignmentForMatching.dateStart;

    const normalizedEndDate =
      selectedAssignmentForMatching.endDate ??
      selectedAssignmentForMatching.dateEnd;

    setCourseDraft(
      toPlanningDraftFromAssignment(selectedAssignmentForMatching),
    );

    setActiveAssignment({
      ...selectedAssignmentForMatching,
      dateStart: normalizedStartDate,
      dateEnd: normalizedEndDate,
      course: {
        name:
          selectedAssignmentForMatching?.course?.name ||
          selectedAssignmentForMatching.name ||
          "Kursschema",
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

  const calendarSource =
    courseDraft ??
    (activeAssignment
      ? {
          startDate: activeAssignment.dateStart,
          endDate: activeAssignment.dateEnd,
          sessionsDraft: activeAssignment.sessions ?? [],
        }
      : null);

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

    return calendarSource.sessionsDraft.map((s, i) => ({
      id: `assignment-${i + 1}`,
      sessionIndex: i,
      title: s.title || s.comment || `Pass ${i + 1}`,
      type: "assignment-session",
      start: new Date(s.timeStart),
      end: new Date(s.timeEnd),
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

  const summaryAssignment =
    plannerMode === "planning"
      ? courseDraft
        ? {
            dateStart: courseDraft.startDate,
            dateEnd: courseDraft.endDate,
            course: {
              name: courseDraft.courseName || "Kursschema",
            },
            sessions: courseDraft.sessionsDraft ?? [],
          }
        : null
      : activeAssignment;

  const sidebarTitle =
    activeAssignment?.course?.name || courseDraft?.courseName || "Ny planering";

  const assignedConsultantName = activeAssignment?.consultant?.name || "";
  const isAssigned = Boolean(activeAssignment?.consultantId);
  const scheduleSummary = buildScheduleSummary(
    activeAssignment?.sessions ?? courseDraft?.sessionsDraft ?? [],
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
      <div className="planner-workspace__header"></div>

      <div className="planner-workspace__layout">
        <aside className="planner-workspace__sidebar">
          <section className="planner-workspace__panel planner-workspace__panel--form">
            <h2>{sidebarTitle}</h2>

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
                onConfirmConsultant={async (consultant) => {
                  setSelectedConsultant(consultant);

                  if (missingFinalInfo.length > 0) {
                    return;
                  }

                  const publishedAssignment = await handlePublishDraft();
                  await handleAssignConsultant(publishedAssignment, consultant);
                }}
                assignedConsultantName={assignedConsultantName}
                scheduleSummary={scheduleSummary}
              />
            )}
          </section>

          {summaryAssignment && !isAssigned ? (
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
  );
}
