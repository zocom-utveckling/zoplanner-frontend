import { Scheduler } from "@zoplanner/calendar";

function Dashboard({ user }) {
  return <Scheduler user={user} />;
}

export { Dashboard };
