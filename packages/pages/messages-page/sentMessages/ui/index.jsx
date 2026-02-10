import { useState } from "react";
import "./index.css"
function SentMessagesPage() {
    const max = 80;
      const [sentMessages, setSentMessages] = useState([{
          recipient: "John Doe",
          subject: "Hello there",
          message: {
              text: "Hello, how are you?",
              createdAt: new Date().toLocaleString(),
          },
      }, {
          recipient: "Jane Smith",
            subject: "Meeting Schedule",
          message: {
              text: "Hello, how are you?",
              createdAt: new Date().toLocaleString(),
          },
      }]);
      return(<>
      <div className="sent-container">
          {sentMessages.length === 0 ? <h2>No Chats found</h2> :
              <div className="sent-content">
                  {sentMessages.map((message) =>
                      <div className="sent-card">
                        <div className="sent-left">  
                        <div className="sent-header">
                          <h3>{message.recipient}</h3>
                        <h4>{message.subject}</h4>
                        </div>
                          <p>{message.message.text.length >max ? message.message.text.slice(0,max)+"...":message.message.text}</p></div>
                          <div className="sent-right">
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

export { SentMessagesPage };