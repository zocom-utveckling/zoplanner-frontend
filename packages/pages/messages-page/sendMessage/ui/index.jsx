import { useEffect, useState } from "react";
import "./index.css";

function SendMessagePopup({ onClose, user }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [recipient, setRecipient] = useState("");
  const [users, setUsers] = useState([]);

  const filteredUsers = users.filter(
    (u) => u.username !== user.username || u.name !== recipient
  );

  const output = filteredUsers.filter((u) =>
    u.name.toLowerCase().includes(recipientInput.toLowerCase())
  );

  useEffect(() => {
    async function getUsers() {
      try {
        const res = await fetch(`http://localhost:5027/api/User`);
        const data = await res.json();
        if (res.ok) setUsers(data);
        else console.log("Could not get users");
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }
    getUsers();
  }, []);

  const handleSelectRecipient = (name) => {
    setRecipient(name);
    setRecipientInput("");
  };

  return (
    <div className="sendOverlay-container">
      <div className="sendOverlay-content">
        <header className="sendOverlay-header">
          <h2>New Message</h2>
          <button
            type="button"
            className="button button_close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <main className="sendOverlay-main">
          <div className="sendOverlay-field">
            <p>
              Från: <span>{user.name}</span>
            </p>
          </div>

          <div className="sendOverlay-field">
            <label htmlFor="recipient">Till:</label>
            <input
              id="recipient"
              type="text"
              value={recipientInput || recipient}
              placeholder="Search for recipient"
              required
              onChange={(e) => {
                setRecipientInput(e.target.value);
                setRecipient("");
              }}
            />
            {output.length > 0 && recipientInput && (
              <ul className="recipient-suggestions">
                {output.map((u) => (
                  <li key={u.id} onClick={() => handleSelectRecipient(u.name)}>
                    {u.name} ({u.username})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sendOverlay-field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Subject..."
            />
          </div>

          <div className="sendOverlay-field">
            <label htmlFor="message">Meddelande</label>
            <textarea
              id="message"
              placeholder="Skriv ditt meddelande här..."
              value={message}
              required
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </main>

        <footer className="sendOverlay-footer">
          <button
            type="button"
            className="button button_cancel"
            onClick={onClose}
          >
            Avbryt
          </button>
          <button type="submit" className="button button_send">
            Skicka
          </button>
        </footer>
      </div>
    </div>
  );
}

export { SendMessagePopup };