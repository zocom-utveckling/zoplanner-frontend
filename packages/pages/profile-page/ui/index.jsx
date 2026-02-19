import { FaUser } from "react-icons/fa";
import "./index.css";
function Profile_Page({user}) {
  return(
    <div className="profile-page-container">
      <header className="profile-page-header">
        <h2>Profile</h2>
        <h2>Edit</h2>

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
      </main>
    </div>
  )
}

export  {Profile_Page};