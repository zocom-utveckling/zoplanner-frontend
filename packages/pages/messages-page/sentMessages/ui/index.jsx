import { useState } from "react";
import "./index.css";
import { MessageOverlay } from "@zoplanner/messageOverlay";

function SentMessagesPage() {
  const max = 80;
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [sentMessages, setSentMessages] = useState([
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
          status={"sent"}
        />
      )}
      <div className="messages-sent__container">
        {sentMessages.length === 0 ? (
          <h2>No Chats found</h2>
        ) : (
          <div className="messages-sent__content">
            {sentMessages.map((message) => (
              <div
                key={message.id || message.recipient}
                className="messages-sent__card"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="messages-sent__left">
                  <div className="messages-sent__header">
                    <h3>{message.recipient}</h3>
                    <h4>{message.subject}</h4>
                  </div>
                  <p>
                    {message.text.length > max
                      ? message.text.slice(0, max) + "..."
                      : message.text}
                  </p>
                </div>
                <div className="messages-sent__right">
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

export { SentMessagesPage };
