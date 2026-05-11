import "./index.css";

function MessageOverlay({ message, onClose, status }) {
  return (
    <div className="message-overlay__overlay">
      <div className="message-overlay__content">
        <header className="message-overlay__header">
          <h2>{status == "recieved" ? message.sender : message.recipient}</h2>
          <button
            type="button"
            className="button button_close-btn"
            onClick={() => onClose()}
          >
            ×
          </button>
        </header>

        <main className="message-overlay__main">
          <header className="message-overlay__meta-header">
            <h3>{message.subject}</h3>
            <p>{message.createdAt}</p>
          </header>
          <section className="message-overlay__body">{message.text}</section>
        </main>

        <footer className="message-overlay__footer">
          <button type="button" className="button button_delete-btn">
            Delete
          </button>
          {status === "recieved" && (
            <button type="button" className="button button_reply-btn">
              Reply
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export { MessageOverlay };
