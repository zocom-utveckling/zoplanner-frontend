import React from "react";
import "./index.css";

function Sidebar({ user }) {
 if (!user) return null;
  // Om ingen profilbild finns, visas personens initialer
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  console.log(user);

  return (
    <aside className="sidebar">
      <div className="user-profile">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">{getInitials(user.name)}</div>
          )}
        </div>
        <div className="brand">{user.name}</div>
      </div>
    </aside>
  );
}

export { Sidebar };
