import { FaUser, FaCamera } from "react-icons/fa";
import "./index.css";
import { Button } from "@zoplanner/button";
import { useState, useEffect, useMemo } from "react";
import { Edit_Profile } from "../edit-profile/ui";
import { Navbar } from "@zoplanner/navbar";
import { useParams } from "react-router-dom";

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

function Profile_Page({ user: initialUser }) {
  const [showEdit, setShowEdit] = useState(false);
  const [user, setUser] = useState(initialUser || null);
  const [isLoadingUser, setIsLoadingUser] = useState(!initialUser);
  const [userError, setUserError] = useState("");
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  const { id } = useParams();
  const userId = user?.id || initialUser?.id || id;

  useEffect(() => {
    if (initialUser || !id) {
      setIsLoadingUser(false);
      return;
    }

    const fetchUser = async () => {
      setIsLoadingUser(true);
      setUserError("");

      try {
        const res = await fetch(`${API_BASE_URL}/api/User/${id}`);
        if (!res.ok) {
          throw new Error("Kunde inte hämta användare");
        }

        const data = await res.json();

        setUser({
          ...data,
          profilePicture: normalizeProfilePictureUrl(
            data.profilePicture || data.profilePictureUrl,
          ),
        });
      } catch (err) {
        console.error(err);
        setUserError("Kunde inte ladda användaren. Försök igen.");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [id, initialUser]);

  const resolvedProfilePicture = useMemo(() => {
    return normalizeProfilePictureUrl(
      user?.profilePicture || user?.profilePictureUrl,
    );
  }, [user?.profilePicture, user?.profilePictureUrl]);

  useEffect(() => {
    if (!user || !resolvedProfilePicture) return;

    if (user.profilePicture === resolvedProfilePicture) return;

    setUser((prev) => ({
      ...prev,
      profilePicture: resolvedProfilePicture,
    }));
  }, [resolvedProfilePicture]);

  useEffect(() => {
    if (!userId) return;

    const syncProfilePicture = (event) => {
      const eventUserId = event?.detail?.userId;
      if (eventUserId && String(eventUserId) !== String(userId)) return;

      const updated = normalizeProfilePictureUrl(event?.detail?.profilePicture);

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

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId) {
      alert("Kunde inte hitta användar-id.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Endast bilder!");
      return;
    }

    try {
      setIsUploadingPicture(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_BASE_URL}/api/User/${userId}/profile-picture`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Uppladdning av profilbild misslyckades");
      }

      const body = await response.json();
      const updatedProfilePicture = normalizeProfilePictureUrl(
        body?.profilePicture || body?.profilePictureUrl,
      );

      if (typeof updatedProfilePicture !== "string" || !updatedProfilePicture) {
        throw new Error("Ogiltigt svar från backend");
      }

      setUser((prev) => ({
        ...prev,
        profilePicture: updatedProfilePicture,
      }));

      window.dispatchEvent(
        new CustomEvent(PROFILE_PICTURE_UPDATED_EVENT, {
          detail: { userId, profilePicture: updatedProfilePicture },
        }),
      );
    } catch (err) {
      console.error(err);
      alert("Något gick fel vid uppladdning av profilbild.");
    } finally {
      setIsUploadingPicture(false);
      e.target.value = "";
    }
  };

  if (isLoadingUser) return <div>Laddar användare...</div>;

  if (userError) return <div>{userError}</div>;

  if (!user) return <div>Ingen användare hittades.</div>;

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
                type="button"
                disabled={isUploadingPicture}
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
