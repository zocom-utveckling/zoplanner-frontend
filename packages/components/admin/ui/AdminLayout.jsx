import "./index.css";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({
  children,
  setView,
  activeView,
  onOpenPlannerPanel,
}) {
  return (
    <div className="admin-container">
      <AdminSidebar
        setView={setView}
        activeView={activeView}
        onOpenPlannerPanel={onOpenPlannerPanel}
      />

      <div className="admin-content">{children}</div>
    </div>
  );
}
