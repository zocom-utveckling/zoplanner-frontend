import { useEffect, useState } from "react";
import "./index.css";

const PROFILE_PICTURE_UPDATED_EVENT = "zoplanner:profile-picture-updated";

const getStoredProfilePicture = (userId) =>
  userId ? localStorage.getItem(`zoplanner.profilePicture.${userId}`) : null;

// En enda källa för fallback-logik
const resolveProfilePicture = (user, override) => {
  if (!user?.id) return null;

  return (
    override ||
    getStoredProfilePicture(user.id) ||
    user.avatar ||
    user.profilePicture ||
    null
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

    const handleStorage = (event) => {
      if (event.key === `zoplanner.profilePicture.${user.id}`) {
        setProfilePicture(resolveProfilePicture(user));
      }
    };

    window.addEventListener(PROFILE_PICTURE_UPDATED_EVENT, syncProfilePicture);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        PROFILE_PICTURE_UPDATED_EVENT,
        syncProfilePicture,
      );
      window.removeEventListener("storage", handleStorage);
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
