import { useState, useEffect, useMemo } from "react";
import {
  CourseSetupForm,
  PlanningDraftList,
  PlannerMonthView,
  CourseSummary,
  loadPlanningDrafts,
  upsertPlanningDraft,
  toAssignmentPayload,
  toSessionPayloads,
} from "@zoplanner/planning-tool";
import { assignmentService, sessionService } from "@zoplanner/api";
import {
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
}) {
  const [focusDate, setFocusDate] = useState(new Date());
  const [courseDraft, setCourseDraft] = useState(null);
  const [planningDrafts, setPlanningDrafts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPlanningDrafts(loadPlanningDrafts());
  }, []);

  useEffect(() => {
    if (!courseDraft) return;
    upsertPlanningDraft(courseDraft);
    setPlanningDrafts(loadPlanningDrafts());
  }, [courseDraft]);

  const calendarGridDays = useMemo(() => {
    if (courseDraft?.startDate && courseDraft?.endDate) {
      const [sy, sm, sd] = courseDraft.startDate.split("-").map(Number);
      const [ey, em, ed] = courseDraft.endDate.split("-").map(Number);

      const start = startOfWeek(new Date(sy, sm - 1, sd), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(new Date(ey, em - 1, ed)), {
        weekStartsOn: 1,
      });

      return eachDayOfInterval({ start, end });
    }

    const start = startOfWeek(startOfMonth(focusDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(focusDate), { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end });
  }, [focusDate, courseDraft]);

  const events = useMemo(() => {
    if (!courseDraft?.sessionsDraft) return [];

    return courseDraft.sessionsDraft.map((s, i) => ({
      id: String(i + 1),
      title: s.title,
      type: "session",
      start: new Date(s.timeStart),
      end: new Date(s.timeEnd),
    }));
  }, [courseDraft]);

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

      // 🔹 Steg 1: skapa assignment
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

      // 👉 Lägg den HÄR
      if (!createdAssignment?.id) {
        console.error("❌ Assignment created without id:", createdAssignment);
        alert("Kunde inte spara kursschema.");
        return;
      }
      // 🔹 Steg 2: skapa sessions
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

      // 🔹 Success
      alert("Kursschema sparat med lektionstillfällen");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="planner-workspace">
      <div className="planner-actions">
        <button
          onClick={handlePublishDraft}
          disabled={!courseDraft || isSaving}
        >
          {isSaving ? "Sparar..." : "Spara som assignment"}
        </button>
      </div>

      {plannerPanel && (
        <div className="planner-workspace__overlay">
          <div className="planner-workspace__overlay-header">
            <h3>
              {plannerPanel === "drafts" ? "Påbörjade utkast" : "Ny planering"}
            </h3>

            <button
              className="planner-workspace__close"
              onClick={onClosePlannerPanel}
            >
              ×
            </button>
          </div>

          <div className="planner-workspace__overlay-body">
            {plannerPanel === "drafts" && (
              <PlanningDraftList
                drafts={planningDrafts}
                onSelect={(draft) => {
                  setCourseDraft(draft);
                  onClosePlannerPanel();
                }}
                selectedDraftId={courseDraft?.id}
              />
            )}

            {plannerPanel === "new" && (
              <CourseSetupForm
                variant="compact"
                onSave={(draft) => {
                  setCourseDraft(draft);
                  onClosePlannerPanel();
                }}
              />
            )}
          </div>
        </div>
      )}

      {assignments.map((a) => (
        <CourseSummary key={a.id} assignment={a} />
      ))}

      <PlannerMonthView
        monthGridDays={calendarGridDays}
        focusDate={focusDate}
        events={events}
      />
    </div>
  );
}
