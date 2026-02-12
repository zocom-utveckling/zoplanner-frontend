import {  useState } from "react";

import "./index.css"
import { OverviewMessages } from "../../overviewMessgaes/ui";
function RecievedMessagesPage({user}) {
    const max = 80;
    const [showFullMessage, setShowFullMessage] = useState(false);
    const [recievedMessages, setRecievedMessages] = useState([{
        sender: "John Doe",
        recipient: user.username,
        subject: "Meeting Reminder",
        message: {
            text:
                 "Hello boss this is a very long message just to demonstrate how the preview will be truncated after one hundred characters and expanded on click."
             ,
            createdAt: new Date().toLocaleString(),
        },
    }, {
        sender: "Jane Smith",
        recipient: user.username,
        subject: "Project Update",
        message: {
            text: "Hello, how are you?",
            createdAt: new Date().toLocaleString(),
        },
    }]);
    return(<>
    {showFullMessage && <OverviewMessages message={recievedMessages[0]} onClose={()=> setShowFullMessage(false)} user={user}/>}
    <div className="recieved-container">
        {recievedMessages.length === 0 ? <h2>No Chats found</h2> :
            <div className="recieved-content">
                {recievedMessages.map((message) =>
                    <div className="recieved-card" onClick={() => setShowFullMessage(!showFullMessage)}>
                      <div className="recieved-left">  <div className="recieved-header">
                        <h3>{message.recipient}</h3>
                      <h4>{message.subject}</h4>
                      </div>
                        <p>{
                        message.message.text.length > max?message.message.text.slice(0,max)+"...":message.message.text}</p></div>
                        <div className="recieved-right">
                            <span>{message.message.createdAt}</span>
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