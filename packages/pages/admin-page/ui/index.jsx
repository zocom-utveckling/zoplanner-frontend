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
import {
  useUserById,
  useCurrentActor,
  useAdminOverview,
} from "@zoplanner/app-hooks";
import { useState } from "react";
import { useParams } from "react-router-dom";

function AdminPage() {
  const { id } = useParams();
  const { user, loading } = useUserById(id);
  const { canAccess, access, isLoadingActor, managerId } =
    useCurrentActor(user);
  const { planningItems, incompleteItems, isLoading, error } =
    useAdminOverview(user);

  const [activePage, setActivePage] = useState("adminpanel");
  const [adminView, setAdminView] = useState("overview");
  const [plannerPanel, setPlannerPanel] = useState(null);
  const [selectedIncompleteItem, setSelectedIncompleteItem] = useState(null);

  const [plannerMode, setPlannerMode] = useState("planning");
  const [selectedAssignmentForMatching, setSelectedAssignmentForMatching] =
    useState(null);

  function handleSidebarViewChange(view) {
    // Opening planner from sidebar should always start in fresh planning mode.
    if (view === "planner") {
      setPlannerMode("planning");
      setSelectedAssignmentForMatching(null);
      setSelectedIncompleteItem(null);
      setPlannerPanel(null);
    }
    setAdminView(view);
  }

  function handleIncompleteItemClick(item) {
    setSelectedAssignmentForMatching(item.assignment);
    setPlannerMode("matching");
    setAdminView("planner");
  }

  if (loading) return <div>Laddar användare...</div>;
  if (isLoadingActor)
    return <main className="admin-page__loading">Laddar...</main>;

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

      <AdminLayout setView={handleSidebarViewChange} activeView={adminView}>
        {adminView === "overview" && (
          <div>
            <AdminOverview
              planningItems={planningItems}
              incompleteItems={incompleteItems}
              isLoading={isLoading}
              error={error}
              onIncompleteItemClick={handleIncompleteItemClick}
            />
          </div>
        )}

        {adminView === "customers" && (
          <CustomerRegistry
            user={user}
            onStartPlanning={(order) => {
              console.log("📌 planning order", order);
              setSelectedAssignmentForMatching(order);
              setPlannerMode("planning");
              setAdminView("planner");
            }}
          />
        )}
        {adminView === "consultants" && <ConsultantRegistry user={user} />}

        {adminView === "courses" && (
          <CourseRegistry
            user={user}
            selectedIncompleteItem={selectedIncompleteItem}
            incompleteItems={incompleteItems}
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
