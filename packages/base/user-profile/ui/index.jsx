import { useEffect, useState, useMemo } from "react";
import {
  normalizeProfilePictureUrl,
  PROFILE_PICTURE_UPDATED_EVENT,
} from "@zoplanner/app-hooks";
import "./index.css";

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
      <div className="user-profile__avatar-wrap">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={user.name}
            className="user-profile__avatar-image"
          />
        ) : (
          <div className="user-profile__avatar-fallback">
            {getInitials(user.name)}
          </div>
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
