import { useState } from "react";
import "./index.css";
import { ConfirmPopup } from "../../../../components/confirm-popup/ui";
import { Button } from "@zoplanner/button";

const cities = ["GÖTEBORG", "MALMÖ", "STOCKHOLM"];
const roles = ["MANAGER", "CONSULTANT", "BOTH"];

function Edit_Profile({ user, onClose, setUser }) {
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [action, setAction] = useState(null);

  const [newUserinfo, setNewUserinfo] = useState({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    city: user.city,
    role: user.role,
    password: user.password,
    availability: user.availability,
    profilePicture: user.profilePicture,
  });
  const hasChanges = JSON.stringify(newUserinfo) !== JSON.stringify(user);
  const updateUser = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5027/api/User/${newUserinfo.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUserinfo),
        },
      );

      if (!res.ok) {
        throw new Error("Redigering misslyckades");
      }

      setUser((prev) => ({
        ...prev,
        ...newUserinfo,
      }));

      setOpenConfirm(false);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Något gick fel vid uppdatering.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitConfirm = () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    setAction("submit");
    setOpenConfirm(true);
  };

  const handleOpenCancelConfirm = () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    setAction("cancel");
    setOpenConfirm(true);
  };

  return (
    <>
      {openConfirm && (
        <ConfirmPopup
          text={
            action === "submit" ? "Spara ändringarna?" : "Ångra ändringarna?"
          }
          onCancel={() => setOpenConfirm(false)}
          onConfirm={action === "submit" ? updateUser : onClose}
        />
      )}

      <div className="edit-overlay" onClick={onClose}>
        <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
          <header className="edit-profile-header">
            <h2>Redigera profil</h2>
          </header>

          <div className="edit-profile-form">
            <img
              src={newUserinfo.profilePicture}
              alt={`${newUserinfo.name}'s profile`}
              className="edit-avatar"
            />

            <section>
              <label>Namn</label>
              <input
                type="text"
                value={newUserinfo.name}
                onChange={(e) =>
                  setNewUserinfo({
                    ...newUserinfo,
                    name: e.target.value,
                  })
                }
                required
              />
            </section>

            <section>
              <label>Användarnamn</label>
              <input
                type="text"
                value={newUserinfo.username}
                onChange={(e) =>
                  setNewUserinfo({
                    ...newUserinfo,
                    username: e.target.value,
                  })
                }
                required
              />
            </section>

            <section>
              <label>Email</label>
              <input
                type="email"
                value={newUserinfo.email}
                onChange={(e) =>
                  setNewUserinfo({
                    ...newUserinfo,
                    email: e.target.value,
                  })
                }
                required
              />
            </section>

            <section>
              <label>Stad</label>
              <select
                value={newUserinfo.city}
                onChange={(e) =>
                  setNewUserinfo({
                    ...newUserinfo,
                    city: e.target.value,
                  })
                }
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </section>

            <section>
              <label>Roll</label>
              <select
                value={newUserinfo.role}
                onChange={(e) =>
                  setNewUserinfo({
                    ...newUserinfo,
                    role: e.target.value,
                  })
                }
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </section>

            <footer className="edit-profile-footer">
              <Button
                type={"button"}
                onClick={handleOpenCancelConfirm}
                style={"delete-btn"}
                text={"Avbryt"}
              />
              <Button
                type={"button"}
                onClick={handleOpenSubmitConfirm}
                style={"reply-btn"}
                text={loading ? "Sparar..." : "Spara ändringar"}
                disabled={loading}
              />
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

export { Edit_Profile };
