import { useState } from "react";
import "./index.css";

import { Button } from "@zoplanner/button";
import { useNavigate,Link } from "react-router-dom";
import {  FaLock, FaUser } from "react-icons/fa"

function LoginPage() {
  const [username,setUsername]=useState("")
  const [password,setPassword]=useState("")
  const [loading,setLoading]=useState(false)
  const navigate =useNavigate()
  const handleSubmit=async(e)=>{
    try{
      e.preventDefault()
      setLoading(true)
     const res = await fetch(`http://localhost:5027/api/User/username/${username}`)
     const data = await res.json()
     if(res.ok){
      if(data.password === password){
        navigate(`/home-page/${data.id}`)
        alert(data.message || `Welcome ${data.name}`)
      }
      else{
        alert("Incorrect username or password")
        setUsername("")
        setPassword("")
        setLoading(false)
        return
      }
     }
     else{
      alert("System error")
      setLoading(false)
      return
      
     }
    }
    catch(error){
      console.log(error)
      alert("Something went wrong")
      setLoading(false)
    }
    finally{
      setLoading(false)
    }
  }
  return (
   <>
   <div className="container">
    <h1>ZoPlanner</h1>
    <form onSubmit={handleSubmit}>
      <h2>login</h2>
       <div className="field">
                <div className="label"><FaUser/> <span>Username</span></div>
                <input type="text" value={username} required placeholder="Enter your username" onChange={e=>setUsername(e.target.value)} />
            </div>
             <div className="field">
                <div className="label"><FaLock/> <span>Password</span></div>
                <input type="password" value={password} required placeholder="Enter your password" minLength={8} onChange={e=>setPassword(e.target.value)} />
            </div>
             <div className="button">
                <Button text={loading?"Loading...":"Login"} type={"submit"} style={"submit"}/>
                <p>Don't have a account?<Link to={"/register"}>Register</Link></p>

            </div>
    
    </form>
   </div>
   </>
  )
}

export { LoginPage };
