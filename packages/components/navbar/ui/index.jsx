import { Link } from "react-router-dom";
import "./index.css";
import {
  FaAngleDown,
  FaAngleUp,
  FaBell,
  FaQuestion,
  FaUser,
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

function Navbar({ user, activePage, setActivePage }) {
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // om user saknas
  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <span className="logo-mark" aria-hidden="true">
            <span className="logo-ring" />
          </span>
          <span className="logo-text">ZoPlanner</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="routes">
          <button
            onClick={() => setActivePage("dashboard")}
            className={activePage == "dashboard" ? "active" : ""}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActivePage("courses")}
            className={activePage == "courses" ? "active" : ""}
          >
            Courses
          </button>
          <button
            onClick={() => setActivePage("messages")}
            className={activePage == "messages" ? "active" : ""}
          >
            Messages
          </button>
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
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <FaUser />
            <span>{user?.name || "Users Name"}</span>
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
