import "./index.css";

export function AdminSidebar({ setView, activeView, onOpenPlannerPanel }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__section-title">Admin</div>

      <nav className="admin-sidebar__nav">
        <button
          className={`admin-sidebar__item ${
            activeView === "overview" ? "active" : ""
          }`}
          onClick={() => setView("overview")}
        >
          Översikt
        </button>

        <button
          className={`admin-sidebar__item ${
            activeView === "customers" ? "active" : ""
          }`}
          onClick={() => setView("customers")}
        >
          Kunder
        </button>

        <button
          className={`admin-sidebar__item ${
            activeView === "consultants" ? "active" : ""
          }`}
          onClick={() => setView("consultants")}
        >
          Konsulter
        </button>

        <button
          className={`admin-sidebar__item ${
            activeView === "courses" ? "active" : ""
          }`}
          onClick={() => setView("courses")}
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
            onClick={() => onOpenPlannerPanel?.("drafts")}
          >
            Påbörjade utkast
          </button>

          <button
            className="admin-sidebar__primary-button"
            onClick={() => onOpenPlannerPanel?.("new")}
          >
            + Ny planering
          </button>
        </div>
      )}
    </aside>
  );
}
