import { useState } from "react";
import "./index.css"
function RecievedChatsPage() {
    const [recievedChats, setRecievedChats] = useState([{
        recipient: "Maaggie Rae",
        latestMessage: {
            text: "Hello boss",
            createdAt: new Date().toLocaleString(),
        },
    }, {
        recipient: "Frank Smith",
        latestMessage: {
            text: "Hello, how are you?",
            createdAt: new Date().toLocaleString(),
        },
    }]);
    return(<>
    <div className="recieved-container">
        {recievedChats.length === 0 ? <h2>No Chats found</h2> :
            <div className="recieved-content">
                {recievedChats.map((message) =>
                    <div className="recieved-card">
                      <div className="recieved-left">  <h3>{message.recipient}</h3>
                        <p>{message.latestMessage.text}</p></div>
                        <div className="recieved-right">
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
export { RecievedChatsPage };