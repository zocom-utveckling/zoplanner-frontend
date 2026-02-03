import { useState } from "react";
import "./index.css"
import { RecievedChatsPage } from "@zoplanner/recieved-messages";
import { SentChatsPage } from "@zoplanner/sent-messages";
function MessagesPage() {
  const [status, setStatus] = useState('recieved');
  
  localStorage.setItem("currentPage",status);
  const currentStatus = localStorage.getItem("currentPage");
  return (<>
    <div className="messages-container">
      <h2>Messages</h2>
      <div className="messages-content">
        <div className="messages-status">
          <p className={`status ${currentStatus==="recieved"?"active-status":""}`} onClick={()=>setStatus("recieved")}>Recieved</p>
          <p className={`status ${currentStatus==="sent"?"active-status":""}`} onClick={()=>setStatus("sent")}>Sent</p>
        </div>
       {status==="recieved"? <RecievedChatsPage/>:<SentChatsPage/>}
      </div>
    </div>
  </>);
}

export { MessagesPage };