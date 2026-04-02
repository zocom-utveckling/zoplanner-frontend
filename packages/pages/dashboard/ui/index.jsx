import { DashboardScheduler } from "@zoplanner/calendar";

function Dashboard({ user }) {
  if (!user) {
    return null;
  }
  return <DashboardScheduler user={user} />;
}

export { Dashboard };
