import { useEffect, useState, useMemo } from "react";
import "./index.css";

const PROFILE_PICTURE_UPDATED_EVENT = "zoplanner:profile-picture-updated";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5027";
const FILES_BASE_URL =
  import.meta.env.VITE_FILES_BASE_URL || "http://localhost:8080";

const normalizeProfilePictureUrl = (value) => {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url) return null;

  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  if (url.startsWith("/files/") || url.startsWith("files/")) {
    const normalizedPath = url.startsWith("/") ? url : `/${url}`;
    return `${FILES_BASE_URL}${normalizedPath}`;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
};

function UserProfile({ user, variant = "default" }) {
  const [profilePicture, setProfilePicture] = useState(null);

  const resolvedProfilePicture = useMemo(() => {
    if (!user?.id) return null;

    return normalizeProfilePictureUrl(
      user.profilePicture || user.profilePictureUrl,
    );
  }, [user?.id, user?.profilePicture, user?.profilePictureUrl]);

  useEffect(() => {
    setProfilePicture(resolvedProfilePicture);
  }, [resolvedProfilePicture]);

  useEffect(() => {
    if (!user?.id) return;

    const syncProfilePicture = (event) => {
      const eventUserId = event?.detail?.userId;
      if (eventUserId && String(eventUserId) !== String(user.id)) return;

      setProfilePicture(
        normalizeProfilePictureUrl(
          event?.detail?.profilePicture ||
            user.profilePicture ||
            user.profilePictureUrl,
        ),
      );
    };

    window.addEventListener(PROFILE_PICTURE_UPDATED_EVENT, syncProfilePicture);

    return () => {
      window.removeEventListener(
        PROFILE_PICTURE_UPDATED_EVENT,
        syncProfilePicture,
      );
    };
  }, [user?.id, user?.profilePicture, user?.profilePictureUrl]);

  if (!user) return null;

  const wrapperClassName =
    variant === "compact"
      ? "user-profile user-profile--compact"
      : "user-profile";

  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatTitle = (value) => {
    if (typeof value !== "string") return "";
    const normalized = value.trim().toLowerCase();
    if (normalized === "both") return "Manager + Consultant";

    return value
      .trim()
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase())
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
        {profilePicture ? (
          <img src={profilePicture} alt={user.name} className="avatar-image" />
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
