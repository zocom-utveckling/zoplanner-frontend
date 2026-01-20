import { Navbar } from "@zoplanner/navbar";
import { Sidebar } from "@zoplanner/sidebar";
import { Scheduler } from "@zoplanner/calendar";
import "./index.css";

function HomePage() {
  return (
    <>
      <Navbar />
      <div className="app">
        <Sidebar />
        <Scheduler />
      </div>
    </>
  );
}
export { HomePage };
