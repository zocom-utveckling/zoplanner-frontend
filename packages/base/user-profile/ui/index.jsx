import React from "react";
import "./index.css";

function UserProfile({ user, variant = "default" }) {
  if (!user) return null;

  const wrapperClassName =
    variant === "compact"
      ? "user-profile user-profile--compact"
      : "user-profile";

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
    <div className={wrapperClassName}>
      <div className="profile-avatar">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">{getInitials(user.name)}</div>
        )}
      </div>
      <div className="user-profile__name">{user.name}</div>
    </div>
  );
}

export { UserProfile };
