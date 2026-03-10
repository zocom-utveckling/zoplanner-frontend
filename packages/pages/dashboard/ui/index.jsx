import { Scheduler } from "@zoplanner/calendar";

function Dashboard({ user, monthOnly = false, allSchedules = false }) {
  if (!user) {
    return null;
  }
  return <Scheduler user={user} monthOnly={monthOnly} allSchedules={allSchedules} />;
}

export { Dashboard };
