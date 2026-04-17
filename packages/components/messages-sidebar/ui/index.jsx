import { useState } from "react";
import "./index.css"
function MessagesSidebar({ onConsultantClick }) {
    const [consultants,setConsultants]=useState([
        {
            username:"konsult1",
            name:"Anna Svensson"
        },
        {
            username:"konsult2",
            name:"Erik Andersson"
        },
        {
            username:"konsult3",
            name:"Maria Bergström"
        },
        {
            username:"konsult4",
            name:"Johan Nilsson"
        },
        {
            username:"konsult5",
            name:"Lisa Eklund"
        },
        {
            username:"konsult6",
            name:"Per Lundgren"
        }
    ])
    return(
        <>
        <div className="sidebar-container">
            <header className="sidebar-header">
                Konsulter
            </header>
            <main className="sidebar-main">
                {
                    consultants? <div>
                        {consultants.map((consultant,index)=>
                        <div className="user" key={index} onClick={() => onConsultantClick && onConsultantClick(consultant)}>
                            <section className="profilBild">{consultant.name.split(' ').map(n => n[0]).join('')}</section>
                            <section className="names">
                                <div className="sidebar-name" >{consultant.name}</div>
                            </section>
                        </div>
                        )}


                    </div>:"Inga konsulter hittades"
                }
            </main>
        </div>
        </>
    )
}
export { MessagesSidebar };