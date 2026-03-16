import "./index.css";
import { PlannerMonthView, CourseSetupForm } from "@zoplanner/planning-tool";
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

  //Debugging purpose
  useEffect(() => {
    console.log("courseDraft updated:", courseDraft);
  }, [courseDraft]);

  const calendarGridDays = useMemo(() => {
    if (courseDraft?.startDate && courseDraft?.durationWeeks) {
      const [year, month, day] = courseDraft.startDate.split("-").map(Number);
      const courseStartDate = new Date(year, month - 1, day);

      const courseEndDate = new Date(courseStartDate);
      courseEndDate.setDate(
        courseStartDate.getDate() + courseDraft.durationWeeks * 7 - 1,
      );

      const start = startOfWeek(courseStartDate, { weekStartsOn: 1 });
      const end = endOfWeek(courseEndDate, { weekStartsOn: 1 });

      return eachDayOfInterval({ start, end });
    }

    const start = startOfWeek(startOfMonth(focusDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(focusDate), { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end });
  }, [focusDate, courseDraft]);

  //Debugging purpose
  useEffect(() => {
    console.log("calendarGridDays:", calendarGridDays);
  }, [calendarGridDays]);

  const events = useMemo(() => {
    if (!courseDraft?.sessionsDraft) {
      return [];
    }

    return courseDraft.sessionsDraft.map((session, index) => ({
      id: String(index + 1),
      title: session.title,
      type: "session",
      start: new Date(session.dateStart),
      end: new Date(session.dateEnd),
    }));
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
