import { useEffect, useState } from "react";
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

const resolveProfilePicture = (user, override) => {
  if (!user?.id) return null;

  return normalizeProfilePictureUrl(
    override || user.profilePicture || user.profilePictureUrl,
  );
};

function ProfileCard({ user, logoSrc = null }) {
  const [profilePicture, setProfilePicture] = useState(null);

  const normalizedName = (user?.name || "").replace(/\s+/g, " ").trim();

  // Sätt initialt värde + vid user change
  useEffect(() => {
    setProfilePicture(resolveProfilePicture(user));
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const syncProfilePicture = (event) => {
      const eventUserId = event?.detail?.userId;

      // Ignorera events för andra users
      if (eventUserId && String(eventUserId) !== String(user.id)) return;

      setProfilePicture(
        resolveProfilePicture(user, event?.detail?.profilePicture),
      );
    };

    window.addEventListener(PROFILE_PICTURE_UPDATED_EVENT, syncProfilePicture);

    return () => {
      window.removeEventListener(
        PROFILE_PICTURE_UPDATED_EVENT,
        syncProfilePicture,
      );
    };
  }, [user]);

  if (!user) return null;

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((word) => word?.[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <article className="profile-card-widget">
      <div className="profile-card-widget__header"></div>

      <div className="profile-card-widget__avatar-wrap">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={normalizedName}
            className="profile-card-widget__avatar"
          />
        ) : (
          <div className="profile-card-widget__avatar-fallback">
            {getInitials(normalizedName)}
          </div>
        )}
      </div>

      <div className="profile-card-widget__body">
        <h2 className="profile-card-widget__name">{normalizedName}</h2>
      </div>
    </article>
  );
}

export { ProfileCard };
