import { useEffect, useState } from "react";
import "./index.css";
import { UserProfile } from "@zoplanner/user-profile";
import { ProfileCard } from "@zoplanner/profile-card";
import { AddActivityButton } from "@zoplanner/activity-creation";
import { SidebarMiniCalendar } from "@zoplanner/sidebar-mini-calendar";
import { activityService, userService } from "@zoplanner/api";
import { emitActivitiesUpdated } from "@zoplanner/calendar";

function Sidebar({ user, onSelectCalendarUser }) {
  const roleValue =
    typeof user?.role === "string" ? user.role.toLowerCase() : "";
  const normalizedRoles = roleValue
    .split(/[\s,;|/+-]+/)
    .map((role) => role.trim())
    .filter(Boolean);
  const isManager =
    normalizedRoles.includes("manager") || normalizedRoles.includes("both");

  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(true);
  const [addActivityOpenKey, setAddActivityOpenKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    if (!isManager) {
      setUsers([]);
      setIsLoadingUsers(false);
      return () => {
        isCancelled = true;
      };
    }

    async function loadUsers() {
      setIsLoadingUsers(true);

      try {
        const data = await userService.getAll();
        if (!isCancelled) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!isCancelled) {
          setUsers([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingUsers(false);
        }
      }
    }

    loadUsers();

    return () => {
      isCancelled = true;
    };
  }, [isManager]);

  const handleSubmitActivity = async (activityData) => {
    if (!user?.id) return false;

    const payload = {
      title: activityData?.title || "Aktivitet",
      type: activityData?.type || "meeting",
      color: activityData?.color || "blue",
      date: activityData?.date,
      startTime: activityData?.startTime,
      endTime: activityData?.endTime,
      description: activityData?.description || "",
      userId: user.id,
    };

    try {
      await activityService.create(payload);
      // Signalera till andra kalendervyer att de ska ladda om sin data.
      emitActivitiesUpdated(user.id);
      return true;
    } catch {
      return false;
    }
  };

  const listedUsers = user
    ? users.filter((listedUser) => listedUser?.id !== user?.id)
    : users;

  if (!user) {
    return null;
  }

  return (
    <aside className="sidebar__root">
      <ProfileCard user={user} />

      {isManager && (
        <div className="sidebar__users">
          <button
            type="button"
            className="sidebar__users__toggle"
            onClick={() => setIsUsersOpen((prev) => !prev)}
            aria-expanded={isUsersOpen}
          >
            <span className="sidebar__users__title">Konsulter</span>
            <span
              className={`sidebar__users__chevron${isUsersOpen ? " is-open" : ""}`}
              aria-hidden="true"
            />
          </button>

          <div
            className={`sidebar__users__list${isUsersOpen ? " is-open" : ""}`}
          >
            {isLoadingUsers ? (
              <div className="sidebar__users__loading">Laddar användare...</div>
            ) : listedUsers.length ? (
              listedUsers.map((listedUser) => (
                <div
                  key={
                    listedUser?.id || listedUser?.username || listedUser?.name
                  }
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    onSelectCalendarUser && onSelectCalendarUser(listedUser)
                  }
                >
                  <UserProfile user={listedUser} variant="compact" />
                </div>
              ))
            ) : (
              <div className="sidebar__users__empty">
                Inga användare hittades.
              </div>
            )}
          </div>
        </div>
      )}

      <AddActivityButton
        onClick={() => setAddActivityOpenKey((current) => current + 1)}
      />

      <SidebarMiniCalendar
        onSubmit={handleSubmitActivity}
        openRequestKey={addActivityOpenKey}
      />
    </aside>
  );
}

export { Sidebar };
