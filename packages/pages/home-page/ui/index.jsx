import { Navbar } from "@zoplanner/navbar";
import { Sidebar } from "@zoplanner/sidebar";
import { Scheduler } from "@zoplanner/calendar";
import "./index.css";
import { Dashboard } from "@zoplanner/dashboard";

function HomePage() {
  return (
    <>
      <Navbar />
      <div className="app">
        <Sidebar />
        <Dashboard/>
      </div>
    </>
  );
}
export { HomePage };
