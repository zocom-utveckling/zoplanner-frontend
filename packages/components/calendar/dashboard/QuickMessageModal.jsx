import React, { useState } from "react";
import "./QuickMessageModal.css";
import { SendDirectMessage } from "../../notis-knapp/hooks/notisHook";

export default function QuickMessageModal({
  open,
  onClose,
  recipient,
  onSend,
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!message.trim() || !subject.trim() || !recipient?.email) return;

    setIsLoading(true);
    setError(null);

    try {
      await SendDirectMessage({
        RecipientEmail: recipient.email,
        Message: message,
        Subject: subject,
      });
      onSend?.(message);
      setSubject("");
      setMessage("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="quick-message-modal-backdrop">
      <div className="quick-message-modal">
        <h3>Skicka meddelande till {recipient?.name}</h3>
        
        <input
          type="text"
          className="quick-message-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ämne..."
          disabled={isLoading}
        />

        <textarea
          className="quick-message-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Skriv ditt meddelande här..."
          rows={4}
          disabled={isLoading}
        />

        {error && <p className="quick-message-error">{error}</p>}

        <div className="quick-message-actions">
          <button
            className="quick-message-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Avbryt
          </button>
          <button
            className="quick-message-send"
            onClick={handleSend}
            disabled={!message.trim() || !subject.trim() || isLoading}
          >
            {isLoading ? "Skickar..." : "Skicka"}
          </button>
        </div>
      </div>
    </div>
  );
}
