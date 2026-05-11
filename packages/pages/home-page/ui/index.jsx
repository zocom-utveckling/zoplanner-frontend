import { Navbar } from "@zoplanner/navbar";
import { Sidebar } from "@zoplanner/sidebar";
import { AllSchedulesScheduler, DashboardScheduler } from "@zoplanner/calendar";
import { CoursesPage } from "@zoplanner/courses-page";
import { MessagesPage } from "@zoplanner/messages-page";
import { Profile_Page } from "@zoplanner/profile-page";
import { userService } from "@zoplanner/api";
import "./index.css";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function DashboardLayout({
  user,
  activePage,
  setActivePage,
  children,
  onSelectCalendarUser,
  onResetCalendarUser,
}) {
  return (
    <>
      <Navbar
        user={user}
        activePage={"dashboard"}
        onResetCalendarUser={onResetCalendarUser}
      />
      <div className="home-page__root">
        <Sidebar user={user} onSelectCalendarUser={onSelectCalendarUser} />
        {children}
      </div>
    </>
  );
}

function HomePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [calendarUser, setCalendarUser] = useState(null);

  useEffect(() => {
    const viewFromUrl = searchParams.get("view");
    if (viewFromUrl) {
      setActivePage(viewFromUrl);
    } else {
      setActivePage("dashboard");
    }
  }, [searchParams]);

  // Funktion för att återställa kalendern till manager
  const handleResetCalendarUser = () => setCalendarUser(null);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const data = await userService.getById(id);
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, [id]);

  // renderar inte förrän vi har användardata, annars får vi error när vi försöker accessa user.name i Navbar
  if (!user) {
    return <div>Laddar användare...</div>;
  }

  const roleValue =
    typeof user?.role === "string" ? user.role.toLowerCase() : "";
  const normalizedRoles = roleValue
    .split(/[\s,;|/+-]+/)
    .map((role) => role.trim())
    .filter(Boolean);
  const isManager =
    normalizedRoles.includes("manager") || normalizedRoles.includes("both");

  const resolvedActivePage =
    activePage === "allSchedules" && !isManager ? "dashboard" : activePage;

  let pageContent;
  switch (resolvedActivePage) {
    case "allSchedules":
      pageContent = <AllSchedulesScheduler user={user} />;
      break;
    case "courses":
      pageContent = <CoursesPage />;
      break;
    case "messages":
      pageContent = <MessagesPage user={user} />;
      break;
    case "profile":
      pageContent = <Profile_Page user={user} />;
      break;
    case "dashboard":
    default:
      pageContent = (
        <DashboardScheduler
          user={calendarUser || user}
          calendarUser={calendarUser}
          managerUser={user}
        />
      );
  }

  return (
    <DashboardLayout
      user={user}
      activePage={resolvedActivePage}
      setActivePage={setActivePage}
      onSelectCalendarUser={setCalendarUser}
      onResetCalendarUser={handleResetCalendarUser}
    >
      {pageContent}
    </DashboardLayout>
  );
}
export { HomePage };
