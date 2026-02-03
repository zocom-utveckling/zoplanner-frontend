import { Navbar } from "@zoplanner/navbar";
import { Sidebar } from "@zoplanner/sidebar";
import { Scheduler } from "@zoplanner/calendar";
import "./index.css";
import { useEffect, useState } from "react";
import { CoursesPage } from "@zoplanner/courses-page";
import { MessagesPage } from "@zoplanner/messages-page";
import { Dashboard } from "@zoplanner/dashboard";
import { useParams } from "react-router-dom";
function HomePage() {
  const {id}=useParams()
  const [user,setUser]=useState(null)
  useEffect(()=>{
    const fetchUser=async()=>{
     try{
       const res = await fetch(`http://localhost:5027/api/User/${id}`)
      const data = await res.json()
      if(res.ok){
        setUser(data)
        console.log(data.name)
      }
      else{
        console.log("Could not fetch user")
      }
     }
     catch(error){
      console.error(error)
     }
      
    }
    fetchUser()
  },[id])
  const [activePage,setActivePage]=useState("dashboard");
  return (
    <>
      <Navbar user={user} activePage={activePage} setActivePage={setActivePage}/>
      <div className="app">
        <Sidebar user={user} />
       { activePage=="dashboard"? <Dashboard/>:activePage=="courses"?<CoursesPage/>:<MessagesPage user={user}/>}
      </div>
    </>
  );
}
export { HomePage };
