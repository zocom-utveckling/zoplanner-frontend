import { Scheduler } from "@zoplanner/calendar";

function Dashboard({ user }) {
  if (!user) {
    return null;
  }
  return <Scheduler user={user} />;
}

export { Dashboard };
