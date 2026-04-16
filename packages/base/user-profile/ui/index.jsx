import { useEffect, useState, useMemo } from "react";
import "./index.css";

const PROFILE_PICTURE_UPDATED_EVENT = "zoplanner:profile-picture-updated";

/*
  TODO (TA BORT SEN):
  localStorage används temporärt för att simulera sparad profilbild.

  När backend är klar:
  - Ta bort denna funktion helt
  - Använd istället user.profilePictureUrl från API
*/
const getStoredProfilePicture = (userId) =>
  userId ? localStorage.getItem(`zoplanner.profilePicture.${userId}`) : null;

function UserProfile({ user, variant = "default" }) {
  const [profilePicture, setProfilePicture] = useState(null);

  /*
    TODO:
    När backend är klar:
    - Ta bort getStoredProfilePicture
    - Ta bort user.avatar fallback (om ni standardiserar backend)
    - Använd ENDAST:
        user.profilePictureUrl

    Ex:
      return user.profilePictureUrl || null;
  */
  const resolvedProfilePicture = useMemo(() => {
    if (!user?.id) return null;

    return (
      getStoredProfilePicture(user.id) ||
      user.avatar ||
      user.profilePicture ||
      null
    );
  }, [user?.id, user?.avatar, user?.profilePicture]);

  /*
    TODO:
    Denna sync behövs bara för localStorage fallback.

    När backend är klar:
    - Ta bort hela denna useEffect
    - Sätt istället direkt:
        const profilePicture = user.profilePictureUrl
  */
  useEffect(() => {
    setProfilePicture(resolvedProfilePicture);
  }, [resolvedProfilePicture]);

  /*
    TODO:
    Event + storage används nu för att synca profilbild mellan komponenter.

    När backend är klar har du 3 val:

    1. Behåll event (enkelt)
    2. Refetch user efter upload (rekommenderat)
    3. Använd global state (bäst i längden, t.ex. Zustand)

    Om du kör refetch/global state:
    - Ta bort HELA denna useEffect
  */
  useEffect(() => {
    if (!user?.id) return;

    const syncProfilePicture = (event) => {
      const eventUserId = event?.detail?.userId;
      if (eventUserId && String(eventUserId) !== String(user.id)) return;

      setProfilePicture(
        event?.detail?.profilePicture ||
          getStoredProfilePicture(user.id) ||
          user.avatar ||
          user.profilePicture ||
          null,
      );
    };

    const handleStorage = (event) => {
      if (event.key === `zoplanner.profilePicture.${user.id}`) {
        syncProfilePicture();
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
  }, [user?.id, user?.avatar, user?.profilePicture]);

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
