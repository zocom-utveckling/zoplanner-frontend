import "./index.css";
import {
  PlannerMonthView,
  PlanningDraftList,
  loadPlanningDrafts,
  upsertPlanningDraft,
} from "@zoplanner/planning-tool";
import { Navbar } from "@zoplanner/navbar";
import {
  AdminLayout,
  CustomerRegistry,
  ConsultantRegistry,
  CourseRegistry,
  ManagerTaskOverview,
} from "@zoplanner/admin";
import { useUserById, useCurrentActor } from "@zoplanner/app-hooks";
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
  const { canAccess, access, isLoadingActor } = useCurrentActor(user);

  const [activePage, setActivePage] = useState("adminpanel");
  const [adminView, setAdminView] = useState("planner");
  const [focusDate, setFocusDate] = useState(new Date());
  const [courseDraft, setCourseDraft] = useState(null);
  const [planningDrafts, setPlanningDrafts] = useState([]);

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
      const end = endOfWeek(new Date(ey, em - 1, ed), { weekStartsOn: 1 });

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

  if (loading) return <div>Laddar användare...</div>;
  if (isLoadingActor) return <main className="main">Laddar...</main>;

  const canOpenAdminPage = canAccess(access.ADMIN);

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

      <AdminLayout
        setView={setAdminView}
        activeView={adminView}
        planningDrafts={planningDrafts}
        onSelectDraft={setCourseDraft}
      >
        {adminView === "overview" && (
          <div>
            <ManagerTaskOverview />

            <PlanningDraftList
              drafts={planningDrafts}
              onSelect={(draft) => setCourseDraft(draft)}
            />
          </div>
        )}

        {adminView === "customers" && <CustomerRegistry />}

        {adminView === "consultants" && <ConsultantRegistry user={user} />}

        {adminView === "courses" && <CourseRegistry user={user} />}

        {adminView === "planner" && (
          <PlannerMonthView
            monthGridDays={calendarGridDays}
            focusDate={focusDate}
            events={events}
          />
        )}
      </AdminLayout>
    </>
  );
}

export { AdminPage };
