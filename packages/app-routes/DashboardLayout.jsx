import { Outlet, useParams } from "react-router-dom";
import { Navbar } from "@zoplanner/navbar";
import { Sidebar } from "@zoplanner/sidebar";
import { useUserById } from "@zoplanner/app-hooks";
import "./index.css";

function DashboardLayout() {
  const { id } = useParams();
  const { user, loading, error } = useUserById(id);

  if (loading) {
    return <div>Laddar användare...</div>;
  }

  if (error || !user) {
    return <div>Kunde inte hämta användare.</div>;
  }

  return (
    <>
      <Navbar user={user} />
      <div className="app">
        <Sidebar user={user} />
        <Outlet context={{ user }} />
      </div>
    </>
  );
}

export { DashboardLayout };
