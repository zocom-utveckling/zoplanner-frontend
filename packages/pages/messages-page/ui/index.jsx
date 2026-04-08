import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css"
import { RecievedMessagesPage } from "@zoplanner/recieved-messages";
import { SentMessagesPage } from "@zoplanner/sent-messages";
import { SendMessagePopup } from "../sendMessage";
import { FaPenAlt, FaPenSquare } from "react-icons/fa";
import "react-icons/fa6"
import { Navbar } from "@zoplanner/navbar";

function MessagesPage({ user: initialUser }) {
  const [status, setStatus] = useState('recieved');
  const [show, setShow] = useState(false);
  const { id } = useParams();
  const [user, setUser] = useState(initialUser || null);

  useEffect(() => {
    if (initialUser || !id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5027/api/User/${id}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          console.error("Could not fetch user");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [id, initialUser]);

  if (!user) {
    return <div>Laddar användare...</div>;
  }

  localStorage.setItem("currentPage", status);
  const currentStatus = localStorage.getItem("currentPage");
  return (<>
  <Navbar activePage={"messages"} user={user}/>
  {show&& <SendMessagePopup user={user} onClose={()=> setShow(false)}/>}
    <div className="messages-container">
      <div className="messages-headers">
        <h2>Meddelande</h2>
      <h3 onClick={()=>setShow(true)}><FaPenSquare /></h3>
      </div>
      <div className="messages-content">
        <div className="messages-status">
          <p className={`status ${currentStatus==="recieved"?"active-status":""}`} onClick={()=>setStatus("recieved")}>Mottagen</p>
          <p className={`status ${currentStatus==="sent"?"active-status":""}`} onClick={()=>setStatus("sent")}>Skickat</p>
        </div>
       {status==="recieved"? <RecievedMessagesPage user={user}/> : <SentMessagesPage user={user}/>}
      </div>
    </div>
  </>);
}

export { MessagesPage };