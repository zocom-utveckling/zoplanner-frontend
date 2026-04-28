import { useEffect, useState } from "react";
import "./index.css";
import "react-icons/fa"
import { FaPlus } from "react-icons/fa";
import { SendAssignmentNotification } from "../../../components/notis-knapp";
import { Navbar } from "@zoplanner/navbar";
import { useParams } from "react-router-dom";
function CoursesPage() {
  const [assignments, setAssignments] = useState([]);
  const consultantId = localStorage.getItem("consultantId");
  const [user, setUser] = useState(null);
  const [show,setShow]=useState(false)
  const userId =useParams().id
  const maxShownSessions = 2;
  useEffect(() => {
    async function getAssignments() {
      const res = await fetch(
        `http://localhost:5027/api/Assignment/consultant/${consultantId}`,
      );
      const data = await res.json();
      if (res.ok) {
        setAssignments(data);
      } else {
        console.log("Kunde inte hämta data");
      }
    }
    getAssignments();
  }, [consultantId]);
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`http://localhost:5027/api/User/${userId}`);
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
    }

    fetchUser();
  }, [userId]);

  if (!user) {
    return <div>Laddar användare...</div>;
  }

  return (
    <>
      <Navbar activePage={"assignments"} user={user}/>
      <div className="courses-page__container">
         
        <h2>Uppdrag</h2>
        <div className="courses-page__content">
          {assignments.length == 0 ? (
            <h2>Inga uppdrag hittades</h2>
          ) : (
            <div className="courses-page__list">
              {assignments.map((assignment) => (
                <div className="courses-page__assignment-card">
                  <section className="courses-page__assignment-upper">
                    <h2>{assignment.course.name} </h2>

                    <p>
                      {assignment.dateStart}-{assignment.dateEnd}
                    </p>
                  </section>
                  <section className="courses-page__assignment-under">
                    <h3>Lektioner</h3>
                    <div className="courses-page__sessions">
                      {assignment.sessions
                        .slice(0, maxShownSessions)
                        .map((session) => {
                          const [date, startTime] =
                            session.timeStart.split(" ");
                          const [, endTime] = session.timeEnd.split(" ");

                          return (
                            <div className="courses-page__session-card" key={session.id}>
                              <section className="courses-page__session-upper">
                                <h4>{session.comment}</h4>
                                <p>{date}</p>
                              </section>

                              <section className="courses-page__session-under">
                                <p>{session.location}</p>
                                <p>
                                  {startTime} - {endTime}
                                </p>
                              </section>
                            </div>
                          );
                        })}
                      {assignment.sessions.length > maxShownSessions && (
                        <p>
                          +{assignment.sessions.length - maxShownSessions} more
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
     
       <SendAssignmentNotification/> 
    </>
  );
}

export { CoursesPage };
