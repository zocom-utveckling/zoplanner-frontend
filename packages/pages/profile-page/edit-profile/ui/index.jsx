import { useState } from "react";
import "./index.css"
import { Button } from "@zoplanner/button";
const cities =["GÖTEBORG","MALMÖ","STOCKHOLM"]
const roles=["MANAGER","CONSULTANT","BOTH"]
function Edit_Profile({ user, onClose,setUser }) {
    const [loading, setLoading] = useState(false);
  const [newUserinfo, setNewUserinfo] = useState({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    city: user.city,
    role: user.role,
    password: user.password,
      availability: user.availability,
   //profilePicture: user.profilePicture,
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch(`http://localhost:5027/api/User/${newUserinfo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUserinfo),
    });

    if (!res.ok) {
      throw new Error("Redigering misslyckades");
    }
    alert("Redigering lyckades!");
    setUser(newUserinfo);
    onClose();
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="edit-overlay" onClick={onClose}>
      <div
        className="edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="edit-profile-header">
          <h2>Redigera profil</h2>
        </header>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="edit-avatar"><img
            src={newUserinfo.profilePicture}
            alt={String(newUserinfo.name).charAt(0)}
            
          /></div>

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
            <Button type={"button"} text={"Avbryt"} onClick={onClose} style={"delete-btn"}/>
            <Button type={"submit"} text={"Spara ändringar"} style={"reply-btn"}/>
          </footer>
        </form>
      </div>
    </div>
  );
}
export {Edit_Profile}