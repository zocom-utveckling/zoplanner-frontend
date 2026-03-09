import { useEffect, useState } from "react";
import "./index.css"
function CoursesPage() {
const [assignments,setAssignments]=useState([])
const consultantId= localStorage.getItem("consultantId")
const maxShownSessions=2
useEffect(()=>{
  async function getAssignments(){
    const res = await fetch(`http://localhost:5027/api/Assignment/consultant/${consultantId}`)
    const data = await res.json()
    if(res.ok){
      setAssignments(data)
    }
    else{
      console.log("Kunde inte hämta data")
    }
  }
  getAssignments()
},[consultantId])


  return(<>
  <div className="assignment-container">
    <h2>Updrag</h2>
    <div className="assignment-content">
      {
        assignments.length == 0?<h2>Inga updrag hittades</h2>:
        <div className="assignments-list" >
          {assignments.map((assignment)=>(
            <div className="assignment-card">
              <section className="assignment-upper">
               <h2>{assignment.course.name}    </h2>
                         
               <p>
                {assignment.dateStart}-{assignment.dateEnd}
               </p>
               

              </section>
              <section className="assignment-under">
                <h3>Sessions</h3>
               <div className="sessions">
                {assignment.sessions.slice(0,maxShownSessions).map((session)=> {
  const [date, startTime] = session.timeStart.split(" ")
  const [, endTime] = session.timeEnd.split(" ")

  return (
    <div className="session-card" key={session.id}>
      
      <section className="session-upper">
       
        <h4 >{session.comment}</h4>
         <p>{date}</p>
      </section>

      <section className="session-under">
        <p>{session.location}</p>
        <p>{startTime} - {endTime}</p>
      </section>

    </div>
  )
})}
                {assignment.sessions.length > maxShownSessions && <p>+{assignment.sessions.length - maxShownSessions} more</p>}
               </div>
              </section>
            </div>
          ))}
        </div>
      }
    </div>
  </div>
  </>)
}

export { CoursesPage };