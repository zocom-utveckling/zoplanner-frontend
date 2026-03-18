import { useEffect, useState } from "react";
import "./index.css"
import { AddSession } from "../add-session/ui";
function SendAssignmentNotification() {
const [managerId] = useState(() => localStorage.getItem("managerId"))
const [manager,setManager]=useState(null)
const [consultants,setConsultants]=useState([])
const [selectedConsultant,setSelectedConsultant]=useState("")
const [courses,setCourses]=useState([])
const [selectedCourse,setSelectedCourse]=useState("")
const [dateStart,setDateStart]=useState("")
const [dateEnd,setDateEnd]=useState("")
const [users,setUsers]=useState([])
const [done,setDone]=useState(false)
const [assignmentId,setAssignmentId]=useState(null)
    const allConsultants = consultants.filter(consultant => consultant.managerId === Number(managerId))
  console.log(allConsultants)

/*useEffect(()=>{
    async function getManager(){
        const res = await fetch(`http://localhost:5027/api/Manager/${managerId}`)
        const data = await res.json()
        if(res.ok){
            setManager(data)
            console.log(data)
        }
        else{
            console.log(data.message)
        }
    }
    getManager()
},[managerId])*/
async function sendNotification(assignmentId) {
  const consultant = consultants.find(c => c.id === Number(selectedConsultant))
  const user = users.find(u => u.id === consultant.userId)

  const notification = {
    eventType: "NEW_ASSIGNMENT",
    eventId: crypto.randomUUID().toString(),
    timestamp: new Date().toISOString(),
    teacherId: consultant.id.toString(),
    teacherEmail: user.email,
    assignmentId: assignmentId.toString(),
    assignmentDescription: "New assignment created",
    teacherName: user.name,
    assignmentDueDate: new Date(dateEnd).toISOString()
  }

  const res = await fetch("http://localhost:5027/api/Notification/send-new-assignment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notification)
  })

  if (!res.ok) {
    const data = await res.json()
    console.log("notification error:", data.message)
  }
  else{
    alert("Notis skickad")
  }
}

const handleSubmit = async (e)=>{
e.preventDefault()
const assignment = { consultantId:Number(selectedConsultant),dateStart,dateEnd,courseId:Number(selectedCourse)}
const res = await fetch(`http://localhost:5027/api/Assignment`,{
    method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(assignment)
})
const data = await res.json()
if(res.ok){
    alert("uppdrag skaoades")
    setDone(true)
    setAssignmentId(data.id)
    await sendNotification(data.id)
}
else{
    console.log(data.message)
}

}
useEffect(()=>{
async function getConsultants(){
    const res = await fetch(`http://localhost:5027/api/Consultant`)
    const data = await res.json()
    if(res.ok){
    
        setConsultants(data)
        
    }
    else{
        console.log("backend error")
    }
}
getConsultants()
},[managerId])


useEffect(()=>{
    
    async function getCourses(){
        const res = await fetch(`http://localhost:5027/api/Course`)
        const data = await res.json()
        if(res.ok){
            setCourses(data)
        }
        else{
            console.log(data.message)
        }

    }
    getCourses()
},[])
useEffect(()=>{
    
    async function getUsers(){
        const res = await fetch(`http://localhost:5027/api/User`)
        const data = await res.json()
        if(res.ok){
            setUsers(data)
        }
        else{
            console.log(data.message)
        }

    }
    getUsers()
},[])


return(
    <>
    <div className="assignment-container">
        <div className="assignment-content">
            <form onSubmit={handleSubmit}>
                <section>
                    <label>lärare</label>
                 {allConsultants.length > 0 
  ?<select required value={selectedConsultant} onChange={e => setSelectedConsultant(e.target.value)}>
  {allConsultants.map((consultant) => {
    const user = users.find(u => u.id === consultant.userId)

    return (
      <option key={consultant.id} value={consultant.id}>
        {user?.name || "Unknown"}
      </option>
    )
  })}
</select>
  : <div>Ingen lärare hittades</div>
}

                </section>
                 <section>
                    <label >Kurs</label>
                    {courses.length >0 ? <select required value={selectedCourse} onChange={e=> setSelectedCourse(e.target.value)} > 
                        {courses.map((course)=>(
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>:<div>ingen kurs hittades</div>}
                    </section>
                    <section>
    <label>Startdatum</label>
    <input 
        type="date" 
        required 
        value={dateStart} 
        onChange={e => setDateStart(e.target.value)} 
    />
</section>

<section>
    <label>Slutdatum</label>
    <input 
        type="date" 
        required 
        value={dateEnd} 
        onChange={e => setDateEnd(e.target.value)} 
    />
</section>
<button type="submit">Skapa uppdrag</button>
            </form>
        </div>

    </div>
    </>
)












}



export { SendAssignmentNotification };