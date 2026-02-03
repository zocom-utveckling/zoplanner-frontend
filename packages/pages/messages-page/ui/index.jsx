import { useState } from "react";
import "./index.css"
import { RecievedMessagesPage } from "@zoplanner/recieved-messages";
import { SentMessagesPage } from "@zoplanner/sent-messages";
import { SendMessagePopup } from "../sendMessage";
function MessagesPage({user}) {
  const [status, setStatus] = useState('recieved');
  const [show,setShow]= useState(false)
  
  localStorage.setItem("currentPage",status);
  const currentStatus = localStorage.getItem("currentPage");
  return (<>
  {show&& <SendMessagePopup user={user} onClose={()=> setShow(false)}/>}
    <div className="messages-container">
      <h2>Messages</h2>
      <h2 onClick={()=>setShow(true)}>New message</h2>
      <div className="messages-content">
        <div className="messages-status">
          <p className={`status ${currentStatus==="recieved"?"active-status":""}`} onClick={()=>setStatus("recieved")}>Recieved</p>
          <p className={`status ${currentStatus==="sent"?"active-status":""}`} onClick={()=>setStatus("sent")}>Sent</p>
        </div>
       {status==="recieved"? <RecievedMessagesPage/> : <SentMessagesPage/>}
      </div>
    </div>
  </>);
}

export { MessagesPage };