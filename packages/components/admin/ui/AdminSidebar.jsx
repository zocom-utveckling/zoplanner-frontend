import "./index.css";

export function AdminSidebar({ setView, activeView, onOpenPlannerPanel }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__section-title"></div>

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
          + Ny planering
        </button>
      </nav>
    </aside>
  );
}
