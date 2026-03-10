import { Scheduler } from "@zoplanner/calendar";

function Dashboard({ user, monthOnly = false }) {
  if (!user) {
    return null;
  }
  return <Scheduler user={user} monthOnly={monthOnly} />;
}

export { Dashboard };
