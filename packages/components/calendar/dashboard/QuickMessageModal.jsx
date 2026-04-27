import React from "react";
import "./QuickMessageModal.css";

export default function QuickMessageModal({
  open,
  onClose,
  recipient,
  onSend,
}) {
  const [message, setMessage] = React.useState("");
  if (!open) return null;
  return (
    <div className="quick-message-modal-backdrop">
      <div className="quick-message-modal">
        <h3>Skicka meddelande till {recipient?.name}</h3>
        <textarea
          className="quick-message-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Skriv ditt meddelande här..."
          rows={4}
        />
        <div className="quick-message-actions">
          <button className="quick-message-cancel" onClick={onClose}>
            Avbryt
          </button>
          <button
            className="quick-message-send"
            onClick={() => {
              onSend(message);
              setMessage("");
            }}
            disabled={!message.trim()}
          >
            Skicka
          </button>
        </div>
      </div>
    </div>
  );
}
