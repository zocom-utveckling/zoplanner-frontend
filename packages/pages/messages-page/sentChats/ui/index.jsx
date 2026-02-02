import { useState } from "react";
import "./index.css"
function SentChatsPage() {
      const [sentChats, setSentChats] = useState([{
          recipient: "John Doe",
          latestMessage: {
              text: "Hello, how are you?",
              createdAt: new Date().toLocaleString(),
          },
      }, {
          recipient: "Jane Smith",
          latestMessage: {
              text: "Hello, how are you?",
              createdAt: new Date().toLocaleString(),
          },
      }]);
      return(<>
      <div className="sent-container">
          {sentChats.length === 0 ? <h2>No Chats found</h2> :
              <div className="sent-content">
                  {sentChats.map((message) =>
                      <div className="sent-card">
                        <div className="sent-left">  <h3>{message.recipient}</h3>
                          <p>{message.latestMessage.text}</p></div>
                          <div className="sent-right">
                              <span>{message.latestMessage.createdAt}</span>
                              <span>...</span>
                          </div>
                          
                      </div>
                  )}
              </div>
          }
      </div>
      </>)
}

export { SentChatsPage };