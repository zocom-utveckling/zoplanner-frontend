import { useEffect, useState } from "react";
import "./index.css";
import { SendAssignmentNotification } from "../../../components/notis-knapp";
import { Navbar } from "@zoplanner/navbar";
import { useParams } from "react-router-dom";

function CoursesPage() {
  const [user, setUser] = useState(null);
  const userId = useParams().id;

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`http://localhost:5027/api/User/${userId}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          console.log("Could not fetch user");
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchUser();
  }, [userId]);

  if (!user) {
    return <div>Laddar användare...</div>;
  }

  return (
    <>
      <Navbar activePage={"assignments"} user={user} />
      <div className="courses-page__container">
        <h2>Notis tester</h2>
        <div className="courses-page__content">
        </div>
      </div>

      <SendAssignmentNotification />
    </>
  );
}

export { CoursesPage };
