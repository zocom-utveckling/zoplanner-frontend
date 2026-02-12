import { useState } from "react";
import "./index.css"
import { MessageOverlay } from "../../../../components/message-overlay/ui";
function RecievedMessagesPage({user,status}) {
    const max = 80;
    const [selectedMessage, setSelectedMessage]=useState(null)
    const [recievedMessages, setRecievedMessages] = useState([{
        sender:"Someone else",
        recipient: "Maaggie Rae",
        subject: "Meeting Reminder",
        
            text:
                 "Hello boss this is a very long message just to demonstrate how the preview will be truncated after one hundred characters and expanded on click."
             ,
            createdAt: new Date().toLocaleString(),
    }, {
                sender:"Someone else",
        recipient: "Frank Smith",
        subject: "Project Update",
            text: "Hello, how are you?",
            createdAt: new Date().toLocaleString()
        
    }]);
    return(<>
    {
        selectedMessage !== null && <MessageOverlay onClose={()=> setSelectedMessage(null)} status={status} message={selectedMessage}/>
    }
    <div className="recieved-container">
        {recievedMessages.length === 0 ? <h2>No Chats found</h2> :
            <div className="recieved-content">
                {recievedMessages.map((message) =>
                    <div  className="recieved-card" onClick={()=>setSelectedMessage(message)}>
                      <div className="recieved-left">  <div className="recieved-header">
                        <h3>{message.sender}</h3>
                      <h4>{message.subject}</h4>
                      </div>
                        <p>{
                        message.text.length > max?message.text.slice(0,max)+"...":message.text}</p></div>
                        <div className="recieved-right">
                            <span>{message.createdAt}</span>
                            <span>...</span>
                        </div>
                        
                    </div>
                )}
            </div>
        }
    </div>
    </>)
}
export { RecievedMessagesPage };