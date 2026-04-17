import { useState, useEffect, useRef } from "react";
import "./index.css";

function Chat({ selectedChat, onMessageSend }) {
    const [newMessage, setNewMessage] = useState("");
    const chatMainRef = useRef(null);

    const scrollToBottom = () => {
        const chatMain = chatMainRef.current;
        if (chatMain) {
            chatMain.scrollTop = chatMain.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedChat?.messages]);

    if (!selectedChat) {
        return (
            <div className="chat-container empty">
                <div className="empty-state">
                    <p>Välj en chat för att börja chatta</p>
                </div>
            </div>
        );
    }

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            onMessageSend && onMessageSend({
                text: newMessage,
                timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
            });
            setNewMessage("");
        }
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <div className="chat-avatar">{selectedChat.name.split(' ').map(n => n[0]).join('')}</div>
                <h2>{selectedChat.name}</h2>
            </header>
            <main ref={chatMainRef} className="chat-main">
                <div className="messages-list">
                    {selectedChat.messages && selectedChat.messages.length > 0 ? (
                        selectedChat.messages.map((message) => (
                            <div key={message.id} className={`message ${message.isOwn ? 'own' : 'other'}`}>
                                <div className="message-content">
                                    <p className="message-text">{message.text}</p>
                                    <span className="message-timestamp">{message.timestamp}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-messages">
                            <p>Ingen meddelanden ännu</p>
                        </div>
                    )}
                </div>
            </main>
            <footer className="chat-footer">
                <input
                    type="text"
                    placeholder="Skriv ett meddelande..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="message-input"
                />
                <button onClick={handleSendMessage} className="send-btn">
                    Skicka
                </button>
            </footer>
        </div>
    );
}

export { Chat };
