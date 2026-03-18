import "./index.css";
import {
  PlannerMonthView,
  CourseSetupForm,
  PlanningDraftList,
  loadPlanningDrafts,
  upsertPlanningDraft,
} from "@zoplanner/planning-tool";
import { useMemo, useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

function AdminPage() {
  const [focusDate, setFocusDate] = useState(new Date());

  const [courseDraft, setCourseDraft] = useState(null);

  const [planningDrafts, setPlanningDrafts] = useState([]);

  useEffect(() => {
    const drafts = loadPlanningDrafts();
    setPlanningDrafts(drafts);
  }, []);

  useEffect(() => {
    if (!courseDraft) return;
    upsertPlanningDraft(courseDraft);
    setPlanningDrafts(loadPlanningDrafts());
  }, [courseDraft]);
  const calendarGridDays = useMemo(() => {
    if (courseDraft?.startDate && courseDraft?.endDate) {
      const [startYear, startMonth, startDay] = courseDraft.startDate
        .split("-")
        .map(Number);
      const [endYear, endMonth, endDay] = courseDraft.endDate
        .split("-")
        .map(Number);

      const courseStartDate = new Date(startYear, startMonth - 1, startDay);
      const courseEndDate = new Date(endYear, endMonth - 1, endDay);

      const start = startOfWeek(courseStartDate, { weekStartsOn: 1 });
      const end = endOfWeek(courseEndDate, { weekStartsOn: 1 });

      return eachDayOfInterval({ start, end });
    }

    const start = startOfWeek(startOfMonth(focusDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(focusDate), { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end });
  }, [focusDate, courseDraft]);

  const events = useMemo(() => {
    if (!courseDraft?.sessionsDraft) {
      return [];
    }

    return courseDraft.sessionsDraft.map((session, index) => {
      const parsedStart = new Date(session.timeStart);
      const parsedEnd = new Date(session.timeEnd);

      return {
        id: String(index + 1),
        title: session.title,
        type: "session",
        start: parsedStart,
        end: parsedEnd,
      };
    });
  }, [courseDraft]);

  return (
    <>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Adminpanelen</h1>
        </div>
        <div>
          <div className="admin-grid">
            <section className="admin-card">
              <CourseSetupForm onSave={setCourseDraft} />
            </section>
            <section className="admin-card">
              <PlanningDraftList
                drafts={planningDrafts}
                onSelect={(draft) => setCourseDraft(draft)}
              />
            </section>
          </div>
          <div className="schemaplanerar-container">
            <div className="admin-header">
              <h1>Schemaplanerare</h1>
            </div>
            <PlannerMonthView
              monthGridDays={calendarGridDays}
              focusDate={focusDate}
              events={events}
              onDayClick={(day) => console.log("clicked day", day)}
              onEventClick={(event) => console.log("clicked event", event)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
export { AdminPage };
