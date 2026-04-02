import { AllSchedulesScheduler } from "@zoplanner/calendar";

function AllSchedulesPage({ user }) {
  if (!user) {
    return null;
  }
  return <AllSchedulesScheduler user={user} />;
}

export { AllSchedulesPage };
