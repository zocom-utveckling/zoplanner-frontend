import { useOutletContext } from "react-router-dom";
import { Dashboard } from "@zoplanner/dashboard";

function DashboardRoute() {
  const { user } = useOutletContext();
  return <Dashboard user={user} />;
}

export { DashboardRoute };
