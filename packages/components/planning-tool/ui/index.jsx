import { useState, useEffect, useMemo } from "react";
import { dev } from "@zoplanner/admin";
import {
  CourseSetupForm,
  PlannerMonthView,
  CourseSummary,
  SessionModal,
  ConsultantMatchPanel,
  loadPlanningDrafts,
  upsertPlanningDraft,
  removePlanningDraft,
  toAssignmentPayload,
  toSessionPayloads,
} from "@zoplanner/planning-tool";
import { assignmentService, sessionService } from "@zoplanner/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

export function PlannerWorkspace({
  managerId,
  plannerPanel,
  onClosePlannerPanel,
  plannerMode,
  setPlannerMode,
  selectedAssignmentForMatching,
  clearSelectedAssignmentForMatching,
}) {
  const [focusDate, setFocusDate] = useState(new Date());
  const [courseDraft, setCourseDraft] = useState(null);
  const [planningDrafts, setPlanningDrafts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);

  useEffect(() => {
    setPlanningDrafts(loadPlanningDrafts());
  }, []);

  useEffect(() => {
    if (!courseDraft) return;
    upsertPlanningDraft(courseDraft);
    setPlanningDrafts(loadPlanningDrafts());
  }, [courseDraft]);

  useEffect(() => {
    if (!selectedAssignmentForMatching) return;

    setActiveAssignment({
      ...selectedAssignmentForMatching,
      dateStart: selectedAssignmentForMatching.startDate,
      dateEnd: selectedAssignmentForMatching.endDate,
      course: {
        name: selectedAssignmentForMatching.name || "Kursschema",
      },
      sessions: selectedAssignmentForMatching.sessions ?? [],
    });

    setCourseDraft(null);
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

  const calendarSource = activeAssignment
    ? {
        startDate: activeAssignment.dateStart,
        endDate: activeAssignment.dateEnd,
        sessionsDraft: activeAssignment.sessions ?? [],
      }
    : courseDraft;

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

  const events = useMemo(() => {
    if (!calendarSource?.sessionsDraft?.length) return [];

    return calendarSource.sessionsDraft.map((s, i) => ({
      id: String(i + 1),
      sessionIndex: i,
      title: s.title || s.comment || `Pass ${i + 1}`,
      type: "session",
      start: new Date(s.timeStart),
      end: new Date(s.timeEnd),
    }));
  }, [calendarSource]);

  const summaryAssignment = activeAssignment
    ? activeAssignment
    : courseDraft
      ? {
          dateStart: courseDraft.startDate,
          dateEnd: courseDraft.endDate,
          course: {
            name: courseDraft.courseName || "Kursschema",
          },
          sessions: courseDraft.sessionsDraft ?? [],
        }
      : null;

  const sidebarTitle =
    activeAssignment?.course?.name || courseDraft?.courseName || "Ny planering";

  function handleSessionClick(sessionIndex) {
    if (!courseDraft?.sessionsDraft?.[sessionIndex]) return;

    const session = courseDraft.sessionsDraft[sessionIndex];

    setSelectedSession(sessionIndex);
    setFormData({
      title: session.title ?? session.comment ?? "",
      date: session.dateStart ?? "",
      startTime: session.timeStart?.split("T")[1]?.slice(0, 5) ?? "",
      endTime: session.timeEnd?.split("T")[1]?.slice(0, 5) ?? "",
      location: session.location ?? "ONSITE",
    });
    setIsModalOpen(true);
  }

  function handleSessionFormChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSessionSubmit(event) {
    event.preventDefault();

    if (selectedSession === null || !courseDraft) return;

    const updatedSessions = [...(courseDraft.sessionsDraft ?? [])];
    const currentSession = updatedSessions[selectedSession];

    if (!currentSession) return;

    updatedSessions[selectedSession] = {
      ...currentSession,
      title: formData.title,
      comment: formData.title,
      dateStart: formData.date,
      dateEnd: formData.date,
      timeStart: `${formData.date}T${formData.startTime}:00`,
      timeEnd: `${formData.date}T${formData.endTime}:00`,
      location: formData.location,
    };

    setCourseDraft({
      ...courseDraft,
      sessionsDraft: updatedSessions,
    });

    setIsModalOpen(false);
    setSelectedSession(null);
    setFormData(null);
  }

  function handleSessionModalClose() {
    setIsModalOpen(false);
    setSelectedSession(null);
    setFormData(null);
  }

  function handleEventDrop(sessionIndex, newDate) {
    if (!courseDraft?.sessionsDraft?.[sessionIndex]) return;

    const updatedSessions = [...courseDraft.sessionsDraft];
    const session = updatedSessions[sessionIndex];

    const newDateString = format(newDate, "yyyy-MM-dd");

    const oldStartTime =
      session.timeStart?.split("T")[1]?.slice(0, 8) ?? "09:00:00";
    const oldEndTime =
      session.timeEnd?.split("T")[1]?.slice(0, 8) ?? "12:00:00";

    updatedSessions[sessionIndex] = {
      ...session,
      dateStart: newDateString,
      dateEnd: newDateString,
      timeStart: `${newDateString}T${oldStartTime}`,
      timeEnd: `${newDateString}T${oldEndTime}`,
    };

    setCourseDraft({
      ...courseDraft,
      sessionsDraft: updatedSessions,
    });
  }

  async function handlePublishDraft() {
    if (!courseDraft) return;

    if (!managerId) {
      alert("Kunde inte identifiera användaren. Försök igen.");
      return;
    }

    setIsSaving(true);

    try {
      const assignmentPayload = toAssignmentPayload(courseDraft, managerId);

      let createdAssignment;

      try {
        createdAssignment = await assignmentService.create(assignmentPayload);
        console.log("✅ Assignment created:", createdAssignment);
      } catch (error) {
        console.error(
          "❌ Failed to create assignment:",
          error,
          assignmentPayload,
        );
        alert("Kunde inte spara kursschema.");
        return;
      }

      if (!createdAssignment?.id) {
        console.error("❌ Assignment created without id:", createdAssignment);
        alert("Kunde inte spara kursschema.");
        return;
      }

      try {
        dev.saveCourseNameForAssignment(
          createdAssignment.id,
          courseDraft.courseName,
        );
      } catch (error) {
        console.error("❌ DEV mapping failed:", error);
      }

      const sessionPayloads = toSessionPayloads(courseDraft);

      try {
        for (const sessionPayload of sessionPayloads) {
          await sessionService.create(createdAssignment.id, sessionPayload);
        }
        console.log("✅ Sessions created:", sessionPayloads);
      } catch (error) {
        console.error("❌ Failed to create sessions:", error, sessionPayloads);
        alert(
          "Kursschema sparades, men vissa lektionstillfällen kunde inte sparas.",
        );
        return;
      }

      setActiveAssignment({
        ...createdAssignment,
        dateStart: courseDraft.startDate,
        dateEnd: courseDraft.endDate,
        course: {
          name: courseDraft.courseName || "Kursschema",
        },
        sessions: courseDraft.sessionsDraft ?? [],
      });

      alert("Kursschema sparat med lektionstillfällen");
      setPlannerMode("matching");
      removePlanningDraft(courseDraft.id);
      setPlanningDrafts(loadPlanningDrafts());
      setCourseDraft(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="planner-workspace">
      <div className="planner-workspace__header"></div>

      <div className="planner-workspace__layout">
        <aside className="planner-workspace__sidebar">
          <section className="planner-workspace__panel planner-workspace__panel--form">
            <h2>{sidebarTitle}</h2>

            {plannerMode === "planning" ? (
              <>
                {!activeAssignment && (
                  <CourseSetupForm
                    variant="compact"
                    onSave={(draft) => {
                      setActiveAssignment(null);
                      setCourseDraft(draft);
                    }}
                  />
                )}

                {!activeAssignment && (
                  <button
                    className="planner-btn-primary"
                    onClick={() => {
                      if (!courseDraft) {
                        document.querySelector("form")?.requestSubmit();
                      } else {
                        handlePublishDraft();
                      }
                    }}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? "Sparar..."
                      : courseDraft
                        ? "Spara planering"
                        : "Visa planering"}
                  </button>
                )}

                {activeAssignment && (
                  <button
                    className="planner-btn-primary"
                    onClick={() => setPlannerMode("matching")}
                  >
                    Hitta konsult
                  </button>
                )}
              </>
            ) : (
              <ConsultantMatchPanel
                assignment={activeAssignment}
                consultants={[]}
                onSelectConsultant={(consultant) => {
                  console.log("Vald konsult:", consultant);
                }}
                onBack={() => {
                  setPlannerMode("planning");
                  setCourseDraft(null);
                  setActiveAssignment(null);
                  clearSelectedAssignmentForMatching?.();
                }}
              />
            )}
          </section>

          {summaryAssignment ? (
            <section className="planner-workspace__panel">
              <h2>Översikt</h2>
              <CourseSummary
                assignment={summaryAssignment}
                onDelete={() => {
                  setCourseDraft(null);
                  setActiveAssignment(null);
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
            onEventClick={(event) => handleSessionClick(event.sessionIndex)}
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
