import "./index.css";
import {
  PlannerMonthView,
  PlanningDraftList,
  loadPlanningDrafts,
  upsertPlanningDraft,
  toAssignmentPayload,
  toSessionPayloads,
} from "@zoplanner/planning-tool";
import { Navbar } from "@zoplanner/navbar";
import {
  AdminLayout,
  CustomerRegistry,
  ConsultantRegistry,
  CourseRegistry,
  ManagerTaskOverview,
} from "@zoplanner/admin";
import { assignmentService, sessionService } from "@zoplanner/api";
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
  const [showDebug, setShowDebug] = useState(false);
  const { id } = useParams();
  const { user, loading } = useUserById(id);
  const { canAccess, access, isLoadingActor, managerId } =
    useCurrentActor(user);

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

  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5027/api/Assignment")
      .then((res) => res.json())
      .then(setAssignments)
      .catch(console.error);
  }, []);

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

  async function handlePublishDraft() {
    if (!courseDraft || !managerId) {
      console.error("Saknar courseDraft eller managerId");
      return;
    }

    try {
      const assignmentPayload = toAssignmentPayload(courseDraft, managerId);
      const createdAssignment =
        await assignmentService.create(assignmentPayload);

      const sessionPayloads = toSessionPayloads(courseDraft);

      console.log("createdAssignment", createdAssignment);
      console.log("first session payload", sessionPayloads[0]);
      console.log("all session payloads", sessionPayloads);

      for (const sessionPayload of sessionPayloads) {
        await sessionService.create(createdAssignment.id, sessionPayload);
      }

      alert("Schema sparat som assignment med sessions");
    } catch (error) {
      console.error("Kunde inte spara assignment/sessions:", error);
      alert("Kunde inte spara schema");
    }
  }

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
        onSaveDraft={setCourseDraft}
      >
        {adminView === "overview" && (
          <div>
            <ManagerTaskOverview />

            <PlanningDraftList
              drafts={planningDrafts}
              onSelect={(draft) => setCourseDraft(draft)}
              selectedDraftId={courseDraft?.id}
            />

            <button onClick={handlePublishDraft} disabled={!courseDraft}>
              Spara som assignment
            </button>
          </div>
        )}

        {adminView === "customers" && <CustomerRegistry user={user} />}

        {adminView === "consultants" && <ConsultantRegistry user={user} />}

        {adminView === "courses" && <CourseRegistry user={user} />}

        {adminView === "planner" && (
          <>
            <div className="planner-actions">
              <button onClick={handlePublishDraft} disabled={!courseDraft}>
                Spara som assignment
              </button>
            </div>

            <button
              onClick={() => setShowDebug((prev) => !prev)}
              style={{
                position: "fixed",
                bottom: 10,
                right: 10,
                zIndex: 1000,
              }}
            >
              {showDebug ? "Stäng debug" : "Visa debug"}
            </button>

            {showDebug && (
              <div
                style={{
                  position: "fixed",
                  bottom: 50,
                  right: 10,
                  width: "320px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  background: "#111",
                  color: "#0f0",
                  padding: 10,
                  zIndex: 999,
                  fontSize: "12px",
                  border: "1px solid #444",
                }}
              >
                <h3>Assignments (backend)</h3>

                {assignments.map((a) => (
                  <div key={a.id}>
                    <div>ID: {a.id}</div>
                    <div>Manager: {a.managerId}</div>
                    <div>Sessions: {a.sessions?.length}</div>
                  </div>
                ))}
              </div>
            )}

            <PlannerMonthView
              monthGridDays={calendarGridDays}
              focusDate={focusDate}
              events={events}
            />
          </>
        )}
      </AdminLayout>
    </>
  );
}

export { AdminPage };
