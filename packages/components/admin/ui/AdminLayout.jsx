import "./index.css";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({ children, setView, activeView }) {
  return (
    <div className="admin-layout">
      <AdminSidebar setView={setView} activeView={activeView} />

      <main className="admin-layout__content">{children}</main>
    </div>
  );
}
