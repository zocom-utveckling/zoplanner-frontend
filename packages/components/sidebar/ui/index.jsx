import React, { useEffect, useState } from "react";
import "./index.css";
import { UserProfile } from "@zoplanner/user-profile";
import { AddActivityButton } from "@zoplanner/add-activity-button";
import { MonthCalendar } from "@zoplanner/month-calender-sidebar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const SPRING_API_BASE_URL =
  import.meta.env.VITE_SPRING_API_BASE_URL || "/spring-api";

function Sidebar({ user }) {
  console.log(user);

  const [highlightedDates, setHighlightedDates] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadUsers() {
      setIsLoadingUsers(true);

      try {
        const res = await fetch(`${API_BASE_URL}/User`);
        const data = res.ok ? await res.json() : [];
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
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const toDateKey = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const parseDate = (value) => {
      if (!value) return null;
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
      }
      if (typeof value === "string") {
        const normalized = value.split("T")[0];
        const parsed = new Date(`${normalized}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    };

    async function loadAssignments() {
      if (!user?.id) {
        if (!isCancelled) setHighlightedDates([]);
        return;
      }

      let consultantId = user?.consultantId || user?.consultant?.id;

      if (!consultantId) {
        try {
          const consultantsRes = await fetch(
            `${SPRING_API_BASE_URL}/consultants`,
          );
          const consultants = consultantsRes.ok
            ? await consultantsRes.json()
            : [];
          const match = consultants.find(
            (consultant) => consultant?.userId === user?.id,
          );
          consultantId = match?.id;
        } catch {
          consultantId = null;
        }
      }

      if (!consultantId) {
        if (!isCancelled) setHighlightedDates([]);
        return;
      }

      try {
        const assignmentsRes = await fetch(
          `${SPRING_API_BASE_URL}/assignments/consultant/${consultantId}`,
        );
        const assignments = assignmentsRes.ok
          ? await assignmentsRes.json()
          : [];

        const dateSet = new Set();

        assignments.forEach((assignment) => {
          const startValue =
            assignment?.course?.dateStart ||
            assignment?.dateStart ||
            assignment?.startDate;
          const endValue =
            assignment?.course?.dateEnd ||
            assignment?.dateEnd ||
            assignment?.endDate ||
            startValue;

          const start = parseDate(startValue);
          const end = parseDate(endValue);

          if (!start || !end) return;

          const current = new Date(start);
          const last = new Date(end);
          while (current <= last) {
            const key = toDateKey(current);
            if (key) dateSet.add(key);
            current.setDate(current.getDate() + 1);
          }
        });

        if (!isCancelled) {
          setHighlightedDates(Array.from(dateSet));
        }
      } catch {
        if (!isCancelled) setHighlightedDates([]);
      }
    }

    loadAssignments();

    return () => {
      isCancelled = true;
    };
  }, [user?.id, user?.consultantId, user?.consultant?.id]);

  const handleSubmitActivity = (activityData) => {
    console.log("Ny aktivitet:", activityData);
  };

  const listedUsers = user
    ? users.filter((listedUser) => listedUser?.id !== user?.id)
    : users;

  return (
    <aside className="sidebar">
      <UserProfile user={user} />

      <div className="sidebar-users">
        <button
          type="button"
          className="sidebar-users__toggle"
          onClick={() => setIsUsersOpen((prev) => !prev)}
          aria-expanded={isUsersOpen}
        >
          <span className="sidebar-users__title">Schema</span>
          <span
            className={`sidebar-users__chevron${isUsersOpen ? " is-open" : ""}`}
            aria-hidden="true"
          />
        </button>

        <div className={`sidebar-users__list${isUsersOpen ? " is-open" : ""}`}>
          {isLoadingUsers ? (
            <div className="sidebar-users__loading">Laddar användare...</div>
          ) : listedUsers.length ? (
            listedUsers.map((listedUser) => (
              <UserProfile
                key={listedUser?.id || listedUser?.username || listedUser?.name}
                user={listedUser}
                variant="compact"
              />
            ))
          ) : (
            <div className="sidebar-users__empty">Inga användare hittades.</div>
          )}
        </div>
      </div>

      <AddActivityButton onSubmit={handleSubmitActivity} />

      <MonthCalendar />
    </aside>
  );
}

export { Sidebar };
