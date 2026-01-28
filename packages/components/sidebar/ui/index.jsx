import React from "react";
import "./index.css";
import { UserProfile } from "@zoplanner/user-profile";

function Sidebar({ user }) {
  console.log(user);

  return (
    <aside className="sidebar">
      <UserProfile user={user} />
    </aside>
  );
}

export { Sidebar };
