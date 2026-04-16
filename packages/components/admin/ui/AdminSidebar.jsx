import "./index.css";

export function AdminSidebar({ setView, activeView }) {
  return (
    <div className="admin-tabs">
      <nav className="admin-tabs__nav">
        <button
          className={`admin-tabs__item ${
            activeView === "overview" ? "active" : ""
          }`}
          onClick={() => setView("overview")}
        >
          Översikt
        </button>

        <button
          className={`admin-tabs__item ${
            activeView === "customers" ? "active" : ""
          }`}
          onClick={() => setView("customers")}
        >
          Kunder
        </button>

        <button
          className={`admin-tabs__item ${
            activeView === "consultants" ? "active" : ""
          }`}
          onClick={() => setView("consultants")}
        >
          Konsulter
        </button>

        <button
          className={`admin-tabs__item ${
            activeView === "courses" ? "active" : ""
          }`}
          onClick={() => setView("courses")}
        >
          Kurser
        </button>

        <button
          className={`admin-tabs__item ${
            activeView === "planner" ? "active" : ""
          }`}
          onClick={() => setView("planner")}
        >
          Planera
        </button>
      </nav>
    </div>
  );
}
