import { DashboardScheduler } from "@zoplanner/calendar";

function Dashboard({ user, calendarUser, managerUser }) {
  if (!user) {
    return null;
  }
  return (
    <DashboardScheduler
      user={user}
      calendarUser={calendarUser}
      managerUser={managerUser}
    />
  );
}

export { Dashboard };
