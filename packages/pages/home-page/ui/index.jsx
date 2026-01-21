import { Navbar } from "@zoplanner/navbar";
import { Sidebar } from "@zoplanner/sidebar";
import { Scheduler } from "@zoplanner/calendar";
import "./index.css";
import { useState } from "react";
import { CoursesPage } from "@zoplanner/courses-page";
import { MessagesPage } from "@zoplanner/messages-page";
import { Dashboard } from "@zoplanner/dashboard";
function HomePage() {
  const [activePage,setActivePage]=useState("dashboard");
  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage}/>
      <div className="app">
        <Sidebar />
       { activePage=="dashboard"? <Dashboard/>:activePage=="courses"?<CoursesPage/>:<MessagesPage/>}
      </div>
    </>
  );
}
export { HomePage };
