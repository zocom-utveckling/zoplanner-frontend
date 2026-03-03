import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import {
  FaAngleDown,
  FaAngleUp,
  FaBell,
  FaQuestion,
  FaUser,
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { DarkModeButton } from "@zoplanner/dark-mode-button";
import { ConfirmPopup } from "../../confirm-popup/ui";

function Navbar({ user, activePage, setActivePage }) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const navigate = useNavigate();
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

  const role = (user.role || "").toUpperCase();
  const isManager = role === "MANAGER" || role === "BOTH";

  return (
    <>
      {openConfirm && (
        <ConfirmPopup
          onCancel={() => setOpenConfirm(false)}
          onConfirm={() => navigate("/")}
          text={"Logga ut?"}
        />
      )}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">
            <span className="logo-text">ZoPlanner</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="routes">
            <DarkModeButton />
            {isManager && (
              <button
                onClick={() => {
                  setActivePage("admin");
                  navigate(`/admin-page/${user.id}`);
                }}
                className={activePage == "adminpanel" ? "active" : ""}
              >
                Admin
              </button>
            )}
            <button
              onClick={() => setActivePage("dashboard")}
              className={activePage == "dashboard" ? "active" : ""}
            >
              Skrivbord
            </button>
            <button
              onClick={() => setActivePage("courses")}
              className={activePage == "courses" ? "active" : ""}
            >
              kurser
            </button>
            <button
              onClick={() => setActivePage("messages")}
              className={activePage == "messages" ? "active" : ""}
            >
              Meddelande
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
                <Link onClick={() => setActivePage("profile")}>
                  Se profil
                </Link>
                <Link to={"#"} onClick={() => setOpenConfirm(true)}>
                  Logga ut
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export { Navbar };
