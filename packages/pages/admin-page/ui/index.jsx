import "./index.css";
import {
  PlannerMonthView,
  CourseSetupForm,
  PlanningDraftList,
  loadPlanningDrafts,
  upsertPlanningDraft,
} from "@zoplanner/planning-tool";
import { Navbar } from "@zoplanner/navbar";
import { AdminSidebar } from "../../../components/admin-sidebar";
import { useUserById, useAccess } from "../../../app-hooks";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

function AdminPage() {
  const { id } = useParams();
  const { user, loading } = useUserById(id);
  const { canOpenAdminPage } = useAccess(user);
  console.log("AdminPage user:", user);
  const [activePage, setActivePage] = useState("adminpanel");
  const [adminView, setAdminView] = useState("planner");
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

  if (loading) {
    return <div>Laddar användare...</div>;
  }

  if (!canOpenAdminPage) {
    return <div>Du har inte behörighet att visa adminpanelen.</div>;
  }
  return (
    <>
      <Navbar
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="admin-container">
        <AdminSidebar
          setView={setAdminView}
          activeView={adminView}
          planningDrafts={planningDrafts}
          onSelectDraft={setCourseDraft}
        />

        <div className="admin-content">
          {adminView === "overview" && (
            <div>
              <h1>Översikt</h1>

              <div className="overview-grid">
                <div className="overview-card">
                  <h2>Pågående</h2>

                  <h3>Frontendutbildning</h3>
                  <ul>
                    <li>Granskning av kodprojekt</li>
                    <li>Förbereda lektion</li>
                    <li>Möte med kursledare</li>
                    <li>Sätta betyg på inlämning</li>
                  </ul>
                </div>

                <div className="overview-card">
                  <h2>Kommande uppgifter</h2>
                  <ul>
                    <li>26 apr – Granskning av kodprojekt</li>
                    <li>27 apr – Förbereda lektion</li>
                    <li>28 apr – Möte med kursledare</li>
                  </ul>
                </div>
                <section className="admin-card">
                  <PlanningDraftList
                    drafts={planningDrafts}
                    onSelect={(draft) => setCourseDraft(draft)}
                  />
                </section>
              </div>
            </div>
          )}

          {adminView === "customers" && (
            <div>
              <h1>Kunder</h1>

              <button>+ Ny kund</button>

              <ul>
                <li>AcadeMedia</li>
                <li>NTI Gymnasiet</li>
                <li>Yrgo</li>
              </ul>
            </div>
          )}

          {adminView === "consultants" && (
            <div>
              <h1>Konsulter</h1>

              <button>+ Ny konsult</button>

              <ul>
                <li>Anna Svensson</li>
                <li>Johan Eriksson</li>
                <li>Maria Lund</li>
              </ul>
            </div>
          )}

          {adminView === "courses" && (
            <div>
              <h1>Kurser</h1>

              <button>+ Ny kurs</button>

              <ul>
                <li>Frontend Bootcamp</li>
                <li>Java Grundkurs</li>
                <li>UX Design</li>
              </ul>
            </div>
          )}

          {adminView === "planner" && (
            <div>
              <h1>Schemaplanerare</h1>

              <div className="admin-grid"></div>

              <PlannerMonthView
                monthGridDays={calendarGridDays}
                focusDate={focusDate}
                events={events}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export { AdminPage };
