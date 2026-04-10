import "./index.css";
import { PlannerSidebarForm } from "./PlannerSidebarForm";
import { PlanningDraftList } from "@zoplanner/planning-tool";
import { useState } from "react";

export function AdminSidebar({
  setView,
  activeView,
  planningDrafts = [],
  onSelectDraft,
  onSaveDraft,
}) {
  const [plannerPanel, setPlannerPanel] = useState(null);

  function togglePanel(panelName) {
    setPlannerPanel((prev) => (prev === panelName ? null : panelName));
  }
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__section-title">Admin</div>

      <nav className="admin-sidebar__nav">
        <button
          className={`admin-sidebar__item ${
            activeView === "overview" ? "active" : ""
          }`}
          onClick={() => {
            setView("overview");
            setPlannerPanel(null);
          }}
        >
          Översikt
        </button>

        <button
          className={`admin-sidebar__item ${
            activeView === "customers" ? "active" : ""
          }`}
          onClick={() => {
            setView("customers");
            setPlannerPanel(null);
          }}
        >
          Kunder
        </button>

        <button
          className={`admin-sidebar__item ${
            activeView === "consultants" ? "active" : ""
          }`}
          onClick={() => {
            setView("consultants");
            setPlannerPanel(null);
          }}
        >
          Konsulter
        </button>

        <button
          className={`admin-sidebar__item ${
            activeView === "courses" ? "active" : ""
          }`}
          onClick={() => {
            setView("courses");
            setPlannerPanel(null);
          }}
        >
          Kurser
        </button>

        <div className="admin-sidebar__divider" />

        <button
          className={`admin-sidebar__item ${
            activeView === "planner" ? "active" : ""
          }`}
          onClick={() => setView("planner")}
        >
          Scheman
        </button>
      </nav>
      {activeView === "planner" && (
        <div className="admin-sidebar__planner-actions">
          <button
            className="admin-sidebar__secondary-button"
            onClick={() => togglePanel("drafts")}
          >
            Påbörjade utkast
          </button>

          <button
            className="admin-sidebar__primary-button"
            onClick={() => togglePanel("new")}
          >
            + Ny planering
          </button>
        </div>
      )}

      {activeView === "planner" && plannerPanel && (
        <div className="admin-sidebar__overlay">
          <div className="admin-sidebar__overlay-header">
            <h3>
              {plannerPanel === "drafts" ? "Påbörjade utkast" : "Ny planering"}
            </h3>

            <button
              className="admin-sidebar__close"
              onClick={() => setPlannerPanel(null)}
            >
              ×
            </button>
          </div>

          <div className="admin-sidebar__overlay-body">
            {plannerPanel === "drafts" && (
              <PlanningDraftList
                drafts={planningDrafts}
                onSelect={(draft) => {
                  onSelectDraft?.(draft);
                  setPlannerPanel(null);
                }}
              />
            )}

            {plannerPanel === "new" && (
              <PlannerSidebarForm
                onSave={(draft) => {
                  onSaveDraft?.(draft);
                  setPlannerPanel(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
