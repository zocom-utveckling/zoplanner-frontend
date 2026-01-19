import { Link, NavLink } from "react-router-dom";
import "./index.css";
import {
  FaAngleDown,
  FaAngleUp,
  FaBell,
  FaQuestion,
  FaUser,
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

function Navbar({ user }) {
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadnotification] = useState(["example notification"]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
   <nav className="navbar">
  <div className="navbar-left">
    <div className="logo">Logo</div>
  </div>

  <div className="navbar-right">
    <div className="routes">
      <NavLink>Dashboard</NavLink>
      <NavLink>Courses</NavLink>
      <NavLink>Messages</NavLink>
    </div>

    <div className="icon-group">
      <div className="notification">
        <FaBell />
        {unreadnotification.length > 0 && (
          <span className="badge">{unreadnotification.length}</span>
        )}
      </div>

      <div className="icon">
        <FaQuestion />
      </div>
    </div>

    <div className="profile" ref={dropdownRef}>
      <button
        className="profile-trigger"
        onClick={() => setShowDropdown(prev => !prev)}
      >
        <FaUser />
        <span>{user?.name || "Amir Ahmadi"}</span>
        {showDropdown ? <FaAngleUp /> : <FaAngleDown />}
      </button>

      {showDropdown && (
        <div className="dropdown">
          <Link>View profile</Link>
          <Link>Log out</Link>
        </div>
      )}
    </div>
  </div>
</nav>
  );
}

export { Navbar };