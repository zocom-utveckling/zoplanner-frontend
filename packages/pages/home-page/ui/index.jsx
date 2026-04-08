import { Navbar } from "@zoplanner/navbar";
import { Sidebar } from "@zoplanner/sidebar";
import { Dashboard } from "@zoplanner/dashboard";
import { CoursesPage } from "@zoplanner/courses-page";
import { MessagesPage } from "@zoplanner/messages-page";
import "./index.css";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Profile_Page } from "../../profile-page/ui";

function DashboardLayout({ user, activePage, setActivePage, children }) {
  return (
    <>
      <Navbar
        user={user}
        activePage={"dashboard"}
       
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
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    const viewFromUrl = searchParams.get("view");
    if (viewFromUrl) {
      setActivePage(viewFromUrl);
    } else {
      setActivePage("dashboard");
    }
  }, [searchParams]);
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

  return (
    <DashboardLayout
      user={user}
      activePage={resolvedActivePage}
      setActivePage={setActivePage}
    >
       <Dashboard user={user} />
     
    </DashboardLayout>
  );
}
export { HomePage };
