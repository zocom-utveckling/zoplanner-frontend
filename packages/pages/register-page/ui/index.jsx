import { useState } from "react"
import "./index.css"
import { Link, useNavigate } from "react-router-dom"
const cities =["GÖTEBORG","MALMÖ","STOCKHOLM"]
const roles=["MANAGER","CONSULTANT","BOTH"]

import {Button} from "@zoplanner/button"
import { FaBriefcase, FaLock, FaMapMarkedAlt,FaEnvelope, FaUser } from "react-icons/fa"
import { set } from "date-fns"
function Register(){
    const [name,setName]=useState("")
    const [username,setUsername]=useState("")
    const [city,setCity]=useState("Göteborg")
    const [role,setRole]=useState("MANAGER")
    const [password,setPassword]=useState("")
    const [email,setEmail]=useState("")
    const [loading,setLoading]=useState(false)
    
    const navigate= useNavigate()
    const addConsultant = async ({userId,city})=>{
        try{
            const consultant = {userId,managerId:1,city}
            if(!userId){
                alert("Hittade inte användaren")
                return
            }
            const res = await fetch("http://localhost:5027/api/Consultant",{
                 method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(consultant)
            })
            const data = await res.json()
            if(!res.ok){
                alert("Kunde inte lägga till konsultant")
                return
            }
            localStorage.setItem("consultantId",data.id)
            localStorage.setItem("managerId",data.managerId)
            alert("Konto skapat")
            navigate(`/home-page/${userId}`)

        }
        catch(error){
            alert("Något har gått fel")
        }
    }
        const addManager = async ({userId})=>{
        try{
            if(!userId){
                alert("Hittade inte användaren")
                return
            }
            const res = await fetch(`http://localhost:5027/api/Manager/${userId}`,{
                 method:"POST",
                headers:{"Content-Type":"application/json"}
            })
            const data = await res.json()
            if(!res.ok){
                alert("Kunde inte lägga till Manager")
                return
            }
            alert("Konto skapat")
            navigate(`/home-page/${userId}`)

        }
        catch(error){
            alert("Något har gått fel")
        }
    }
    const handleSubmit=async(e)=>{
        try{
            setLoading(true)
            e.preventDefault()
            const user={name,username,city,role,password,email}
            const res = await fetch("http://localhost:5027/api/User",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(user)
            })
            const data = await res.json()
           if(!res.ok){
            alert("Registering misslycakdes")
            return
           }
           if(role ==="MANAGER"){
           await addManager({userId:data.id})
           }
           else{
           await addConsultant({userId:data.id,city:"GÖTEBORG"})
           }
           
        }
        catch(error){
            console.log("error: "+ error)
            alert("Something went wrong")
            setLoading(false)
        }
        finally{
            setLoading(false)
        }
    }
    return(<>
    <div className="container">
        <h1>ZoPlanner </h1>
        <form onSubmit={handleSubmit}>
            <h2>Create account</h2>
            <div className="field">
                <div className="label"><FaUser/> <span>Full name</span></div>
                <input type="text" value={name} required placeholder="Enter your full name" onChange={e=>setName(e.target.value)} />
            </div>
            <div className="field">
                <div className="label"><FaEnvelope/> <span>Email</span></div>
                <input type="email" value={email} required placeholder="Enter your email" onChange={e=>setEmail(e.target.value)} />
            </div>
             <div className="field">
                <div className="label"><FaUser/> <span>Username</span></div>
                <input type="text" value={username} required placeholder="Choose a username" onChange={e=>setUsername(e.target.value)} />
            </div>
            <div className="field">
                <div className="label"><FaMapMarkedAlt/> <span>City</span></div>
                <select value={city} onChange={e=>setCity(e.target.value)}>
                    {cities.map((c)=>(
                        <option key={c}>{c}</option>
                    ))}
                </select>
            </div>
            <div className="field">
                <div className="label"><FaBriefcase/> <span>Role</span></div>
                <select value={role} onChange={e=>setRole(e.target.value)}>
                    {roles.map((c)=>(
                        <option key={c}>{c}</option>
                    ))}
                </select>
            </div>
            <div className="field">
                <div className="label"><FaLock/> <span>Password</span></div>
                <input type="password" value={password} required placeholder="Create a password" minLength={8} onChange={e=>setPassword(e.target.value)} />
            </div>
            <div className="button">
                <Button text={loading?"Loading....":"Create account"} type={"submit"} style={"submit"}/>
                <p>Already have a account?<Link to={"/"}>Login</Link></p>

            </div>
            
        </form>
    </div>
    </>)
}
export {Register}