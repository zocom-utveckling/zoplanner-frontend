import "./index.css";
import { AdminSidebar } from "@zoplanner/admin";

export function AdminLayout({
  children,
  setView,
  activeView,
  planningDrafts,
  onSelectDraft,
}) {
  return (
    <div className="admin-container">
      <AdminSidebar
        setView={setView}
        activeView={activeView}
        planningDrafts={planningDrafts}
        onSelectDraft={onSelectDraft}
      />

      <div className="admin-content">{children}</div>
    </div>
  );
}
