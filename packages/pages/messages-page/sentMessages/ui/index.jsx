import { useState } from "react";
import "./index.css"
import { MessageOverlay } from "../../../../components/message-overlay/ui";
function SentMessagesPage({user,status}) {
    const max = 80;
     const [selectedMessage, setSelectedMessage]=useState(null)
    const [sentMessages, setSentMessages] = useState([{
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
      <div className="sent-container">
          {sentMessages.length === 0 ? <h2>No Chats found</h2> :
              <div className="sent-content">
                  {sentMessages.map((message) =>
                      <div className="sent-card" onClick={()=>setSelectedMessage(message)}>
                        <div className="sent-left">  
                        <div className="sent-header">
                          <h3>{message.recipient}</h3>
                        <h4>{message.subject}</h4>
                        </div>
                          <p>{message.text.length >max ? message.text.slice(0,max)+"...":message.text}</p></div>
                          <div className="sent-right">
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

export { SentMessagesPage };