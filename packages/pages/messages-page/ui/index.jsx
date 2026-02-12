import { useState } from "react";
import "./index.css"
import { RecievedMessagesPage } from "@zoplanner/recieved-messages";
import { SentMessagesPage } from "@zoplanner/sent-messages";
import { SendMessagePopup } from "../sendMessage";
import { FaPenAlt, FaPenSquare } from "react-icons/fa";
import "react-icons/fa6"

function MessagesPage({user}) {
  if(!user) return null;
  const [status, setStatus] = useState('recieved');
  const [show,setShow]= useState(false)
  
  localStorage.setItem("currentPage",status);
  const currentStatus = localStorage.getItem("currentPage");
  return (<>
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