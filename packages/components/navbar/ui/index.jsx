import { appRoutesConfig } from "../../../app-routes/appRoutes.config";

import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import { FaAngleDown, FaAngleUp, FaBell, FaUser } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { DarkModeButton } from "@zoplanner/dark-mode-button";
import { useProfilePicture } from "@zoplanner/app-hooks";
import { ConfirmPopup } from "../../confirm-popup/ui";

function Navbar({ user, activePage, setActivePage, onResetCalendarUser }) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadnotification] = useState(["example notification"]);
  const [comingSoonFor, setComingSoonFor] = useState(null);

  useEffect(() => {
    if (!comingSoonFor) return;
    const timer = setTimeout(() => setComingSoonFor(null), 2000);
    return () => clearTimeout(timer);
  }, [comingSoonFor]);

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

  const roleValue =
    typeof user?.role === "string" ? user.role.toLowerCase() : "";
  const normalizedRoles = roleValue
    .split(/[\s,;|/+-]+/)
    .map((role) => role.trim())
    .filter(Boolean);
  const isManager =
    normalizedRoles.includes("manager") || normalizedRoles.includes("both");
  const homeRoute = appRoutesConfig.home.replace(":id", String(user.id));
  const { profilePicture } = useProfilePicture(
    user?.id,
    user?.profilePicture || user?.profilePictureUrl,
  );

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
        <div className="navbar__left">
          <button
            className="navbar__logo"
            onClick={() => {
              if (onResetCalendarUser) onResetCalendarUser();
              navigate(homeRoute);
            }}
          >
            <img
              className="navbar__logo-image"
              src="/zoplanner-logo-navbar.png"
              alt="ZoPlanner"
            />
          </button>
        </div>

        <div className="navbar__right">
          <div className="navbar__icon-group">
            <button
              type="button"
              className="navbar__notification"
              onClick={() =>
                setComingSoonFor((prev) =>
                  prev === "notification" ? null : "notification",
                )
              }
              aria-label="Notiser"
            >
              <FaBell />
              {unreadnotification.length > 0 && (
                <span className="navbar__notification-badge">
                  {unreadnotification.length}
                </span>
              )}
              {comingSoonFor === "notification" && (
                <span className="navbar__coming-soon" role="status">
                  Kommer inom kort
                </span>
              )}
            </button>

            <DarkModeButton />

            <button
              type="button"
              className="navbar__icon navbar__locale-chip"
              onClick={() =>
                setComingSoonFor((prev) =>
                  prev === "locale" ? null : "locale",
                )
              }
              aria-label="Byt språk"
            >
              SV
              {comingSoonFor === "locale" && (
                <span className="navbar__coming-soon" role="status">
                  Kommer inom kort
                </span>
              )}
            </button>
          </div>

          <div className="navbar__routes">
            <button
              onClick={() => {
                if (onResetCalendarUser) onResetCalendarUser();
                navigate(`/dashboard/${user.id}`);
              }}
              className={
                activePage == "dashboard"
                  ? "navbar__route-btn navbar__route-btn--active"
                  : "navbar__route-btn"
              }
            >
              Skrivbord
            </button>
            {isManager && (
              <button
                onClick={() => {
                  navigate(`/admin-page/${user.id}`);
                }}
                className={
                  activePage == "adminpanel"
                    ? "navbar__route-btn navbar__route-btn--active"
                    : "navbar__route-btn"
                }
              >
                Admin
              </button>
            )}
            <button
              onClick={() => {
                navigate(`/messages/${user.id}`);
              }}
              className={
                activePage == "messages"
                  ? "navbar__route-btn navbar__route-btn--active"
                  : "navbar__route-btn"
              }
            >
              Meddelande
            </button>

            <button
              onClick={() => {
                navigate(`/assignment-page/${user.id}`);
              }}
              className={
                activePage == "assignments"
                  ? "navbar__route-btn navbar__route-btn--active"
                  : "navbar__route-btn"
              }
            >
              Uppdrag
            </button>
          </div>

          <div className="navbar__profile" ref={dropdownRef}>
            <button
              className="navbar__profile-trigger"
              onClick={() => navigate(`/profile/${user.id}`)}
              aria-label="Gå till profilsida"
              title={user?.name || "Profil"}
            >
              {profilePicture ? (
                <img
                  className="navbar__profile-avatar"
                  src={profilePicture}
                  alt={user?.name || "Profilbild"}
                />
              ) : (
                <span className="navbar__profile-avatar navbar__profile-avatar--placeholder">
                  <FaUser />
                </span>
              )}
            </button>
            {/* <button
              className="navbar__profile-caret"
              onClick={() => setShowDropdown((prev) => !prev)}
              aria-label="Visa profilmeny"
            >
              {showDropdown ? <FaAngleUp /> : <FaAngleDown />}
            </button>

            {showDropdown && (
              <div className="navbar__dropdown">
                <Link to={`/profile/${user.id}`}>Se profil</Link>
                <Link to={"#"} onClick={() => setOpenConfirm(true)}>
                  Logga ut
                </Link>
              </div>
            )} */}
          </div>
        </div>
      </nav>
    </>
  );
}

export { Navbar };
