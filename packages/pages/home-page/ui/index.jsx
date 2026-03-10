import { Navbar } from "@zoplanner/navbar";
import { Sidebar } from "@zoplanner/sidebar";
import { Dashboard } from "@zoplanner/dashboard";
import { CoursesPage } from "@zoplanner/courses-page";
import { MessagesPage } from "@zoplanner/messages-page";
import "./index.css";

import { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Profile_Page } from "../../profile-page/ui";

function DashboardLayout({ user, activePage, setActivePage, children }) {
  return (
    <>
      <Navbar
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="app">
        <Sidebar user={user} />
        {children}
      </div>
    </>
  );
}

function HomePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  console.log(localStorage.getItem("managerId"));

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5027/api/User/${id}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          console.log(data.name);
        } else {
          console.log("Could not fetch user");
        }
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
  return (
    <DashboardLayout
      user={user}
      activePage={activePage}
      setActivePage={setActivePage}
    >
      {activePage == "dashboard" ? (
        <Dashboard user={user} />
      ) : activePage == "allSchedules" ? (
        <Dashboard user={user} monthOnly={true} />
      ) : activePage == "courses" ? (
        <CoursesPage user={user} />
      ) : activePage == "profile" ? (
        <Profile_Page user={user} setUser={setUser} />
      ) : (
        <MessagesPage user={user} />
      )}
    </DashboardLayout>
  );
}
export { HomePage };
