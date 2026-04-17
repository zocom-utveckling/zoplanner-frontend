import "./index.css";
import { PlannerWorkspace } from "@zoplanner/planning-tool";
import { Navbar } from "@zoplanner/navbar";
import {
  AdminLayout,
  CustomerRegistry,
  ConsultantRegistry,
  CourseRegistry,
  AdminOverview,
} from "@zoplanner/admin";
import { useUserById, useCurrentActor } from "@zoplanner/app-hooks";
import { useState } from "react";
import { useParams } from "react-router-dom";

function AdminPage() {
  const { id } = useParams();
  const { user, loading } = useUserById(id);
  const { canAccess, access, isLoadingActor, managerId } =
    useCurrentActor(user);

  const [activePage, setActivePage] = useState("adminpanel");
  const [adminView, setAdminView] = useState("planner");
  const [plannerPanel, setPlannerPanel] = useState(null);

  const [plannerMode, setPlannerMode] = useState("planning");
  const [selectedAssignmentForMatching, setSelectedAssignmentForMatching] =
    useState(null);

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

      <AdminLayout setView={setAdminView} activeView={adminView}>
        {adminView === "overview" && (
          <div>
            <AdminOverview />
          </div>
        )}

        {adminView === "customers" && <CustomerRegistry user={user} />}
        {adminView === "consultants" && <ConsultantRegistry user={user} />}

        {adminView === "courses" && (
          <CourseRegistry
            user={user}
            onOpenConsultantMatching={(course) => {
              setSelectedAssignmentForMatching(course);
              setPlannerMode("matching");
              setAdminView("planner");
            }}
          />
        )}

        {adminView === "planner" && (
          <PlannerWorkspace
            managerId={managerId}
            plannerPanel={plannerPanel}
            onClosePlannerPanel={() => setPlannerPanel(null)}
            plannerMode={plannerMode}
            setPlannerMode={setPlannerMode}
            selectedAssignmentForMatching={selectedAssignmentForMatching}
            clearSelectedAssignmentForMatching={() =>
              setSelectedAssignmentForMatching(null)
            }
          />
        )}
      </AdminLayout>
    </>
  );
}

export { AdminPage };
