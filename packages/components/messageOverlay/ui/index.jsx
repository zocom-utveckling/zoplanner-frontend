import { Button } from "@zoplanner/button";
import "./index.css";

function MessageOverlay({ message, onClose, status }) {
  return (
    <div className="message-overlay__overlay">
      <div className="message-overlay__content">
        <header className="message-overlay__header">
          <h2>{status == "recieved" ? message.sender : message.recipient}</h2>
          <Button
            text={"×"}
            onClick={() => onClose()}
            type={"button"}
            style={"close-btn"}
          />
        </header>

        <main className="message-overlay__main">
          <header className="message-overlay__meta-header">
            <h3>{message.subject}</h3>
            <p>{message.createdAt}</p>
          </header>
          <section className="message-overlay__body">{message.text}</section>
        </main>

        <footer className="message-overlay__footer">
          <Button text={"Delete"} type={"button"} style={"delete-btn"} />
          {status === "recieved" && (
            <Button text={"Reply"} type={"button"} style={"reply-btn"} />
          )}
        </footer>
      </div>
    </div>
  );
}

export { MessageOverlay };
