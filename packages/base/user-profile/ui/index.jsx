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

  const formatTitle = (value) => {
    if (typeof value !== "string") return "";
    const normalized = value.trim().toLowerCase();
    if (normalized === "both") return "Manager + Consultant";
    return value
      .trim()
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const userTitle =
    formatTitle(user.title) ||
    formatTitle(user.jobTitle) ||
    formatTitle(user.position) ||
    formatTitle(user.role);

  return (
    <div className={wrapperClassName}>
      <div className="profile-avatar">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">{getInitials(user.name)}</div>
        )}
      </div>
      <div className="user-profile__details">
        <div className="user-profile__name">{user.name}</div>
        {userTitle && variant !== "compact" && (
          <div className="user-profile__title">{userTitle}</div>
        )}
      </div>
    </div>
  );
}

export { UserProfile };
