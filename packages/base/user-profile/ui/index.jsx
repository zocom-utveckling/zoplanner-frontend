import React from "react";
import "./index.css";

function UserProfile({ user }) {
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

  return (
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
  );
}

export { UserProfile };
