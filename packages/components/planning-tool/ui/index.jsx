import { useState, useEffect, useMemo } from "react";
import {
  CourseSetupForm,
  PlanningDraftList,
  PlannerMonthView,
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
    if (!courseDraft || !managerId) return;

    setIsSaving(true);

    try {
      const assignmentPayload = toAssignmentPayload(courseDraft, managerId);
      const createdAssignment =
        await assignmentService.create(assignmentPayload);

      const sessionPayloads = toSessionPayloads(courseDraft);

      for (const sessionPayload of sessionPayloads) {
        await sessionService.create(createdAssignment.id, sessionPayload);
      }

      alert("Schema sparat som assignment med sessions");
    } catch (error) {
      console.error("Kunde inte spara assignment/sessions:", error);
      alert("Kunde inte spara schema");
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

      <PlannerMonthView
        monthGridDays={calendarGridDays}
        focusDate={focusDate}
        events={events}
      />
    </div>
  );
}
