import { useState } from "react";
import "./index.css"
function CoursesPage() {
  const [courses,setCourses]=useState([{
    name:"frk24",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  },
{
    name:"frk24",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  }
])

  return(<>
  <div className="course-container">
    <h2>Courses</h2>
    <div className="course-content">
      {
        courses.length == 0?<h2>No courses found</h2>:
        <div className="course-list">
          {courses.map((course)=>
          <div className="course-card">
            <div className="course-left">
              <div>{String(course.name.toUpperCase().split("").slice(0,1).join())}</div>
              <h3>{course.name}</h3>
              </div>

            <div className="course-right">
            <div>
              <label htmlFor="">Start date</label>
               <span>{new Date(course.startDate).toLocaleDateString("sv-SE")}</span>
            </div>
             <div>
              <label htmlFor="">End date</label>
               <span>{new Date(course.endDate).toLocaleDateString("sv-SE")}</span>
            </div>
            </div>
          </div>
          )}
        </div>
      }
    </div>
  </div>
  </>)
}

export { CoursesPage };