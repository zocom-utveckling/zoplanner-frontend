import { useState } from "react";

function AddSession({assignmentId}) {
    const [timeStart, setTimeStart] = useState("");
    const [timeEnd, setTimeEnd] = useState("");
    const [location, setLocation] = useState("ONSITE");
    const [comment, setComment] = useState("");
  const handleSubmit = async (e) => {
  e.preventDefault();

  const session = {
    timeStart: new Date(timeStart).toISOString(),
    timeEnd: new Date(timeEnd).toISOString(),
    location,
    comment
  };

  const res = await fetch(`http://localhost:5027/api/Session/${assignmentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Lektion skapad");
  } else {
    console.log(data.message);
  }
};
    return (
       <div>
        <form onSubmit={handleSubmit}>
            <section>
                <label>Start tid</label>
                <input type="datetime-local" value={timeStart} onChange={e => setTimeStart(e.target.value)} required />
            </section>
            <section>   
                <label>Slut tid</label>     
                    <input type="datetime-local" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} required />
                   </section> 
                   <section>
                    <label htmlFor="">Plats</label>
                    <input type="text" value={location} disabled />
                   </section>
                   <section>
                    <textarea value={comment} onChange={e=> setComment(e.target.value)}></textarea>
                   </section>
                   <button type="submit">Skapa lektion</button>
                   
        </form>
       </div> 
    )
}

export { AddSession };

