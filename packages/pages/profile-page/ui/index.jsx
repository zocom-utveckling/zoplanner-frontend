import { FaUser, FaCamera } from "react-icons/fa";
import "./index.css";
import { Button } from "@zoplanner/button";
import { useState, useEffect, useMemo } from "react";
import { Edit_Profile } from "../edit-profile/ui";
import { Navbar } from "@zoplanner/navbar";
import { useParams } from "react-router-dom";

const PROFILE_PICTURE_UPDATED_EVENT = "zoplanner:profile-picture-updated";

/*
  TODO (TA BORT SEN):
  Denna funktion används endast temporärt för att spara profilbilder i localStorage.
  
  När backend är klar:
  - Ta bort denna funktion helt
  - Profilbild ska istället komma från backend (t.ex. user.profilePictureUrl)
*/
const getStoredProfilePicture = (userId) => {
  if (!userId) return null;

  const saved = localStorage.getItem(`zoplanner.profilePicture.${userId}`);

  // Blob-URL:er ska inte sparas långsiktigt
  if (saved?.startsWith("blob:")) {
    localStorage.removeItem(`zoplanner.profilePicture.${userId}`);
    return null;
  }

  return saved;
};

function Profile_Page({ user: initialUser }) {
  const [showEdit, setShowEdit] = useState(false);
  const [user, setUser] = useState(initialUser || null);

  const { id } = useParams();
  const userId = user?.id || initialUser?.id || id;

  /*
    TODO (UPPDATERA):
    När backend är klar:
    - Byt URL till production (env-variabel)
    - Lägg till loading + error state
    - Säkerställ att backend returnerar profilePictureUrl
  */
  useEffect(() => {
    if (initialUser || !id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5027/api/User/${id}`);
        if (!res.ok) return;

        const data = await res.json();

        /*
          TODO:
          Backend ska returnera t.ex:
          {
            id,
            name,
            email,
            profilePictureUrl
          }

          Då bör du mappa:
          profilePicture: data.profilePictureUrl
        */
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [id, initialUser]);

  /*
    TODO (TA BORT localStorage fallback):
    När backend är klar:
    - Ta bort getStoredProfilePicture
    - Använd ENDAST user.profilePictureUrl från backend
  */
  const resolvedProfilePicture = useMemo(() => {
    if (!userId) return null;

    return getStoredProfilePicture(userId) || user?.profilePicture || null;
  }, [userId, user?.profilePicture]);

  /*
    TODO:
    Denna sync behövs bara pga localStorage.
    När backend används:
    - Ta bort denna useEffect helt
    - user.profilePicture ska redan vara korrekt från API
  */
  useEffect(() => {
    if (!user || !resolvedProfilePicture) return;

    if (user.profilePicture === resolvedProfilePicture) return;

    setUser((prev) => ({
      ...prev,
      profilePicture: resolvedProfilePicture,
    }));
  }, [resolvedProfilePicture]);

  /*
    TODO:
    Event-systemet används nu för att synka mellan komponenter.

    När backend är klar:
    Alternativ 1 (enkelt):
      - Behåll event (snabb UI-sync)

    Alternativ 2 (bättre):
      - Använd global state (React Context / Zustand)
      - Eller refetch user efter upload

    Om du kör refetch:
      → denna useEffect kan tas bort
  */
  useEffect(() => {
    if (!userId) return;

    const syncProfilePicture = (event) => {
      const eventUserId = event?.detail?.userId;
      if (eventUserId && String(eventUserId) !== String(userId)) return;

      const updated =
        event?.detail?.profilePicture || getStoredProfilePicture(userId);

      if (!updated) return;

      setUser((prev) => ({
        ...prev,
        profilePicture: updated,
      }));
    };

    window.addEventListener(PROFILE_PICTURE_UPDATED_EVENT, syncProfilePicture);

    return () => {
      window.removeEventListener(
        PROFILE_PICTURE_UPDATED_EVENT,
        syncProfilePicture,
      );
    };
  }, [userId]);

  /*
    TODO (VIKTIGASTE DELEN):
    När backend är klar:

    ERSÄTT HELA DENNA funktion med:

    1. Skapa FormData:
       const formData = new FormData();
       formData.append("file", file);

    2. Skicka till backend:
       POST /api/User/{id}/profileImage

    3. Backend returnerar:
       { profilePictureUrl: "https://..." }

    4. Spara i state:
       setUser(prev => ({
         ...prev,
         profilePicture: response.profilePictureUrl
       }))

    5. TA BORT:
       - FileReader
       - localStorage
       - CustomEvent
  */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Endast bilder!");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const preview = reader.result;
      if (typeof preview !== "string") return;

      setUser((prev) => ({
        ...prev,
        profilePicture: preview,
      }));

      if (userId) {
        localStorage.setItem(`zoplanner.profilePicture.${userId}`, preview);

        window.dispatchEvent(
          new CustomEvent(PROFILE_PICTURE_UPDATED_EVENT, {
            detail: { userId, profilePicture: preview },
          }),
        );
      }
    };

    reader.readAsDataURL(file);
  };

  if (!user) return <div>Laddar användare...</div>;

  return (
    <>
      <Navbar user={user} activePage={"profile"} />

      {showEdit && (
        <Edit_Profile
          user={user}
          onClose={() => setShowEdit(false)}
          setUser={setUser}
        />
      )}

      <div className="profile-page-container">
        <header className="profile-page-header">
          <h2>Profil</h2>
        </header>

        <main className="profile-content">
          <div className="profile-picture-wrapper">
            <div className="profile-page-avatar-wrapper">
              {resolvedProfilePicture ? (
                <img
                  src={resolvedProfilePicture}
                  alt={user.name}
                  className="profile-page-avatar"
                />
              ) : (
                <div className="profile-page-placeholder">
                  <FaUser size={64} />
                </div>
              )}

              <button
                className="profile-page-camera-btn"
                onClick={() =>
                  document.getElementById("profileFileInput").click()
                }
              >
                <FaCamera size={16} />
              </button>

              <input
                id="profileFileInput"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>

            <h2>{user.name}</h2>
          </div>

          <div className="profile-info">
            <section className="profile-card">
              <label>Email</label>
              <p>{user.email}</p>
            </section>

            <section className="profile-card">
              <label>Username</label>
              <p>{user.username}</p>
            </section>

            <section className="profile-card">
              <label>City</label>
              <p>{user.city}</p>
            </section>

            <section className="profile-card">
              <label>Role</label>
              <p>{user.role}</p>
            </section>
          </div>

          <div className="profile-edit">
            <Button
              text="Redigera"
              type="button"
              style="reply-btn"
              onClick={() => setShowEdit(true)}
            />
          </div>
        </main>
      </div>
    </>
  );
}

export { Profile_Page };
