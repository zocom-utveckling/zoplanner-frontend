import { FaUser, FaCamera } from "react-icons/fa";
import "./index.css";
import { Button } from "@zoplanner/button";
import { useState } from "react";
import { Edit_Profile } from "../edit-profile/ui";
import { Navbar } from "@zoplanner/navbar";
import { useParams } from "react-router-dom";
import { useProfilePicture, useUserById } from "@zoplanner/app-hooks";

function Profile_Page({ user: initialUser }) {
  const [showEdit, setShowEdit] = useState(false);

  const { id } = useParams();

  const {
    user,
    setUser,
    loading: isLoadingUser,
    error: userError,
  } = useUserById(id, initialUser);

  const userId = user?.id || initialUser?.id || id;
  const { profilePicture, isUploadingPicture, handleImageChange } =
    useProfilePicture(userId, user?.profilePicture || user?.profilePictureUrl);

  if (isLoadingUser) return <div>Laddar användare...</div>;

  if (userError)
    return (
      <div>
        {userError.message || "Kunde inte ladda användaren. Försök igen."}
      </div>
    );

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
              {profilePicture ? (
                <img
                  src={profilePicture}
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
