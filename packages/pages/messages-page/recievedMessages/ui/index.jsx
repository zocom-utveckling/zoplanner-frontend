import { useState } from "react";
import { MessageOverlay } from "@zoplanner/messageOverlay";
import "./index.css";
function RecievedMessagesPage() {
  const max = 80;
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [recievedMessages, setRecievedMessages] = useState([
    {
      sender: "John Doe",
      recipient: "Maaggie Rae",
      subject: "Meeting Reminder",

      text: "Hello boss this is a very long message just to demonstrate how the preview will be truncated after one hundred characters and expanded on click.",
      createdAt: new Date().toLocaleString(),
    },
    {
      sender: "Jane Smith",
      recipient: "Frank Smith",
      subject: "Project Update",
      text: "Hello, how are you?",
      createdAt: new Date().toLocaleString(),
    },
  ]);
  return (
    <>
      {selectedMessage && (
        <MessageOverlay
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          status={"recieved"}
        />
      )}
      <div className="messages-recieved__container">
        {recievedMessages.length === 0 ? (
          <h2>No Chats found</h2>
        ) : (
          <div className="messages-recieved__content">
            {recievedMessages.map((message, index) => (
              <div
                key={index}
                className="messages-recieved__card"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="messages-recieved__left">
                  {" "}
                  <div className="messages-recieved__header">
                    <h3>{message.sender}</h3>
                    <h4>{message.subject}</h4>
                  </div>
                  <p>
                    {message.text.length > max
                      ? message.text.slice(0, max) + "..."
                      : message.text}
                  </p>
                </div>
                <div className="messages-recieved__right">
                  <span>{message.createdAt}</span>
                  <span>...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
export { RecievedMessagesPage };
