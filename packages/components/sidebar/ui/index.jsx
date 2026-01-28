import React from "react";
import "./index.css";
import { UserProfile } from "@zoplanner/user-profile";
import { AddActivityButton } from "@zoplanner/add-activity-button";
import { MonthCalendar } from "@zoplanner/month-calender-sidebar";

function Sidebar({ user }) {
  console.log(user);

  const handleSubmitActivity = (activityData) => {
    console.log("Ny aktivitet:", activityData);
    // TODO: Integrate with backend API to save activity
  };

  return (
    <aside className="sidebar">
      <UserProfile user={user} />

      <AddActivityButton onSubmit={handleSubmitActivity} />

      <MonthCalendar />
    </aside>
  );
}

export { Sidebar };
