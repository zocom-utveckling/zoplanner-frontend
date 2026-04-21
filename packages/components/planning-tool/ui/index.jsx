import { useState, useEffect, useMemo } from "react";
import { dev } from "@zoplanner/admin";
import { useConsultantMatching } from "../hooks/useConsultantMatching";
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
  toPlanningDraftFromAssignment,
  toSessionPayloads,
} from "@zoplanner/planning-tool";
import {
  assignmentService,
  sessionService,
  activityService,
} from "@zoplanner/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function toDateTime(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toActivityDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;

  const normalizedTime =
    String(timeValue).length === 5 ? `${timeValue}:00` : String(timeValue);
  return toDateTime(`${dateValue}T${normalizedTime}`);
}

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
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [consultantAssignmentEvents, setConsultantAssignmentEvents] = useState(
    [],
  );
  const [consultantActivities, setConsultantActivities] = useState([]);
  async function loadConsultantActivities(consultantUserId) {
    try {
      const response = await activityService.getAll();
      const activities = Array.isArray(response)
        ? response
        : (response.data ?? []);

      const filtered = activities.filter((a) => a.userId === consultantUserId);

      setConsultantActivities(filtered);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setConsultantActivities([]);
    }
  }

  const [isLoadingConsultantSchedule, setIsLoadingConsultantSchedule] =
    useState(false);
  const [isAssigningConsultant, setIsAssigningConsultant] = useState(false);
  const { consultants, loading: consultantsLoading } = useConsultantMatching();

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

  useEffect(() => {
    if (!selectedConsultant?.id || !selectedConsultant?.userId) {
      setConsultantAssignmentEvents([]);
      setConsultantActivities([]);
      setIsLoadingConsultantSchedule(false);
      return;
    }

    let isCancelled = false;

    async function loadConsultantAssignments() {
      setIsLoadingConsultantSchedule(true);

      try {
        const assignmentResponse = await assignmentService.getByConsultantId(
          selectedConsultant.id,
        );
        console.log("ASSIGNMENTS:", assignmentResponse);

        const assignments = toArray(assignmentResponse);
        const scheduleEvents = assignments.flatMap(
          (assignment, assignmentIndex) =>
            toArray(assignment?.sessions)
              .filter((session) => session?.timeStart && session?.timeEnd)
              .map((session, sessionIndex) => ({
                id: `consultant-session-${selectedConsultant.id}-${assignment?.id ?? assignmentIndex}-${session?.id ?? sessionIndex}`,
                title:
                  session.comment ||
                  session.title ||
                  assignment?.course?.name ||
                  "Bokad session",
                type: "consultant-session",
                start: new Date(session.timeStart),
                end: new Date(session.timeEnd),
                draggable: false,
              })),
        );

        if (!isCancelled) {
          setConsultantAssignmentEvents(scheduleEvents);
        }
      } catch (error) {
        console.error("Failed to load consultant assignments:", error);

        if (!isCancelled) {
          setConsultantAssignmentEvents([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingConsultantSchedule(false);
        }
      }
    }

    loadConsultantActivities(selectedConsultant.userId);
    loadConsultantAssignments();

    return () => {
      isCancelled = true;
    };
  }, [selectedConsultant?.id, selectedConsultant?.userId]);

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

  const consultantActivityEvents = useMemo(() => {
    if (!consultantActivities?.length || !selectedConsultant?.id) return [];

    return consultantActivities
      .map((activity, index) => {
        const start =
          toDateTime(activity?.timeStart) ||
          toActivityDateTime(activity?.date, activity?.startTime);

        const end =
          toDateTime(activity?.timeEnd) ||
          toActivityDateTime(activity?.date, activity?.endTime);

        if (!start || !end || end <= start) return null;

        const baseTitle =
          activity.title ||
          activity.name ||
          activity.description ||
          "Aktivitet";

        const cleanTitle = baseTitle.replace(/^Godkänd: |^Avböjd: /, "");

        const isAccepted = baseTitle.startsWith("Godkänd:");
        const isDeclined = baseTitle.startsWith("Avböjd:");
        const isRequest = cleanTitle === "Förfrågan om ändring";

        return {
          id: `activity-${selectedConsultant.id}-${activity.id}`,
          activityId: activity.id,
          isRequest,

          title: isRequest
            ? isAccepted
              ? `✅ ${cleanTitle}`
              : isDeclined
                ? `❌ ${cleanTitle}`
                : `⚠️ ${cleanTitle}`
            : cleanTitle,

          type: isRequest
            ? isAccepted
              ? "consultant-request-accepted"
              : isDeclined
                ? "consultant-request-declined"
                : "consultant-request"
            : "consultant-activity",

          start,
          end,
          draggable: false,
        };
      })
      .filter(Boolean);
  }, [consultantActivities, selectedConsultant]);

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

  async function handleAssignConsultant() {
    if (!activeAssignment?.id || !selectedConsultant?.id) return;

    setIsAssigningConsultant(true);

    try {
      const updatedAssignment = await assignmentService.update(
        activeAssignment.id,
        {
          consultantId: selectedConsultant.id,
          managerId: activeAssignment.managerId ?? managerId ?? null,
          dateStart: activeAssignment.dateStart,
          dateEnd: activeAssignment.dateEnd,
        },
      );

      setActiveAssignment((previous) => ({
        ...previous,
        ...updatedAssignment,
        consultantId: selectedConsultant.id,
        consultant: selectedConsultant,
        course: previous?.course ?? updatedAssignment?.course,
        sessions: previous?.sessions ?? updatedAssignment?.sessions ?? [],
      }));

      alert(`Konsult ${selectedConsultant.name} har tilldelats uppdraget.`);
    } catch (error) {
      console.error("Failed to assign consultant:", error);
      alert("Kunde inte tilldela konsult till uppdraget.");
    } finally {
      setIsAssigningConsultant(false);
    }
  }

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
      requestChange: false,
    });
    setIsModalOpen(true);
  }

  async function handleSessionFormChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSessionSubmit(event) {
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

    if (formData.requestChange && selectedConsultant?.id) {
      const payload = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        title: "Förfrågan om ändring",
        type: "other",
        description:
          formData.requestComment ||
          "Jag ser att du har en bokning här – finns det möjlighet att justera så att du kan ta detta pass?",
        userId: selectedConsultant.userId,
      };

      console.log("🚀 Activity payload:", payload);
      activityService
        .create(payload)
        .then((res) => {
          console.log("✅ SUCCESS:", res);

          const newActivity = res;

          setConsultantActivities((prev) => [...prev, newActivity]);
        })
        .catch((error) => {
          console.error("❌ ERROR:", error);
        });
    }

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
      const existingAssignmentId =
        courseDraft.assignmentId ??
        (Number.isFinite(Number(courseDraft.id))
          ? Number(courseDraft.id)
          : null);

      let savedAssignment;

      if (existingAssignmentId) {
        try {
          savedAssignment = await assignmentService.update(
            existingAssignmentId,
            assignmentPayload,
          );
          console.log("✅ Assignment updated:", savedAssignment);
        } catch (error) {
          console.error(
            "❌ Failed to update assignment:",
            error,
            assignmentPayload,
          );
          alert("Kunde inte uppdatera kursschema.");
          return;
        }
      } else {
        try {
          savedAssignment = await assignmentService.create(assignmentPayload);
          console.log("✅ Assignment created:", savedAssignment);
        } catch (error) {
          console.error(
            "❌ Failed to create assignment:",
            error,
            assignmentPayload,
          );
          alert("Kunde inte spara kursschema.");
          return;
        }
      }

      if (!savedAssignment?.id) {
        console.error("❌ Assignment saved without id:", savedAssignment);
        alert("Kunde inte spara kursschema.");
        return;
      }

      try {
        dev.saveCourseNameForAssignment(
          savedAssignment.id,
          courseDraft.courseName,
        );
      } catch (error) {
        console.error("❌ DEV mapping failed:", error);
      }

      try {
        const assignmentId = savedAssignment.id;
        const draftSessions = courseDraft.sessionsDraft ?? [];
        const existingIds = courseDraft.existingSessionIds ?? [];

        const existingSessions = draftSessions.filter(
          (session) => typeof session.id === "number",
        );

        const newSessions = draftSessions.filter(
          (session) => typeof session.id !== "number",
        );

        for (const session of existingSessions) {
          await sessionService.update(session.id, {
            timeStart: session.timeStart,
            timeEnd: session.timeEnd,
            location: session.location,
            comment: session.title,
          });
        }

        for (const session of newSessions) {
          await sessionService.create(assignmentId, {
            timeStart: session.timeStart,
            timeEnd: session.timeEnd,
            location: session.location,
            comment: session.title,
          });
        }

        const currentIds = existingSessions.map((session) => session.id);

        const deletedIds = existingIds.filter((id) => !currentIds.includes(id));

        for (const id of deletedIds) {
          await sessionService.remove(id);
        }

        console.log("✅ Sessions synced");
      } catch (error) {
        console.error("❌ Failed to sync sessions:", error);
        alert(
          "Kursschema sparades, men vissa lektionstillfällen kunde inte sparas.",
        );
        return;
      }

      setActiveAssignment({
        ...savedAssignment,
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
                {!courseDraft && (
                  <CourseSetupForm
                    variant="compact"
                    onSave={(draft) => {
                      setActiveAssignment(null);
                      setSelectedConsultant(null);
                      setCourseDraft(draft);
                    }}
                  />
                )}

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

                {courseDraft && (
                  <button
                    className="planner-btn-secondary"
                    onClick={() => setPlannerMode("matching")}
                  >
                    Hitta konsult
                  </button>
                )}
              </>
            ) : consultantsLoading ? (
              <p>Laddar konsulter...</p>
            ) : (
              <>
                <div className="planner-match-actions">
                  <p className="planner-match-actions__status">
                    {isLoadingConsultantSchedule
                      ? "Laddar konsultens befintliga schema..."
                      : selectedConsultant
                        ? `Visar schema för ${selectedConsultant.name}.`
                        : "Välj en konsult för att förhandsvisa schemat."}
                  </p>

                  <button
                    type="button"
                    className="planner-btn-primary"
                    onClick={handleAssignConsultant}
                    disabled={!selectedConsultant || isAssigningConsultant}
                  >
                    {isAssigningConsultant
                      ? "Tilldelar..."
                      : selectedConsultant
                        ? `Tilldela ${selectedConsultant.name}`
                        : "Tilldela vald konsult"}
                  </button>
                </div>

                <ConsultantMatchPanel
                  assignment={activeAssignment}
                  consultants={consultants}
                  selectedConsultantId={selectedConsultant?.id}
                  onSelectConsultant={(consultant) => {
                    setSelectedConsultant(consultant);
                  }}
                  onBack={() => {
                    setPlannerMode("planning");
                    setCourseDraft(
                      selectedAssignmentForMatching
                        ? toPlanningDraftFromAssignment(
                            selectedAssignmentForMatching,
                          )
                        : null,
                    );
                    setActiveAssignment(null);
                    setSelectedConsultant(null);
                    setConsultantAssignmentEvents([]);
                  }}
                />
              </>
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
            onEventClick={(event) => {
              if (event.type === "assignment-session") {
                handleSessionClick(event.sessionIndex);
                return;
              }

              if (event.type === "consultant-request") {
                const accepted = window.confirm(
                  `${event.title}\n\n${event.description || ""}\n\nOK = Godkänn\nAvbryt = Avböj`,
                );

                const activityId = event.activityId;

                const original = consultantActivities.find(
                  (a) => String(a.id) === String(activityId),
                );

                if (!original) return;

                const cleanTitle = original.title.replace(
                  /^Godkänd: |^Avböjd: /,
                  "",
                );

                const newTitle = accepted
                  ? `Godkänd: ${cleanTitle}`
                  : `Avböjd: ${cleanTitle}`;

                activityService
                  .update(activityId, {
                    title: newTitle,
                  })
                  .then(() => {
                    setConsultantActivities((prev) =>
                      prev.map((a) =>
                        String(a.id) === String(activityId)
                          ? { ...a, title: newTitle }
                          : a,
                      ),
                    );
                  });
              }
            }}
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
