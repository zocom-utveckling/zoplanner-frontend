import { FaEdit, FaUser } from "react-icons/fa";
import "./index.css";
import { Button } from "@zoplanner/button";
import { useState,useEffect } from "react";
import { Edit_Profile } from "../edit-profile/ui";
import { Navbar } from "@zoplanner/navbar";
import { useParams } from "react-router-dom";
function Profile_Page({ user:initialUser}) {
  const [showEdit, setShowEdit] = useState(false);
  const [user, setUser] = useState(initialUser || null);
  const { id } = useParams();

  useEffect(() => {
    if (initialUser || !id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5027/api/User/${id}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          console.error("Could not fetch user");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [id, initialUser]);

  if (!user) {
    return <div>Laddar användare...</div>;
  }

  return (
    <>
      <Navbar user={user} activePage={"profile"} />
      {showEdit && (
        <Edit_Profile user={user} onClose={() => setShowEdit(false)} setUser={setUser} />
      )}
      <div className="profile-page-container">
      <header className="profile-page-header">
        <h2>Profil</h2>

      </header>
      <main className="profile-content">
       <div>
        <div className="profile-picture">
            {user.profilePicture ? (
          <img src={user.profilePicture} alt={`${user.name}'s profile`} className="profile-picture" />
        ) : (
          <div className="profile-placeholder">
            <FaUser size={64} />
          </div>
        )}
         <h2>{user.name}</h2>
            </div>
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
        <Button text={"Redigera"} type={"button"} style={"reply-btn"} onClick={()=> setShowEdit(true)} /> 
     </div>
      </main>
    </div>
     </>
  )
}

export  {Profile_Page};