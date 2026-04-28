import "./index.css";

function ChatSidebar({ chats, selectedChat, onChatSelect, onChatDelete }) {
  return (
    <>
      <div className="chat-sidebar">
        <header className="chat-sidebar__header">Inbox</header>
        <main className="chat-sidebar__main">
          {chats && chats.length > 0 ? (
            <div>
              {chats.map((chat) => (
                <div
                  className={`chat-sidebar__item ${selectedChat?.chatId === chat.chatId ? "chat-sidebar__item--active" : ""}`}
                  key={chat.chatId}
                  onClick={() => onChatSelect && onChatSelect(chat)}
                >
                  <section className="chat-sidebar__avatar">
                    {chat.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </section>
                  <section className="chat-sidebar__names">
                    <div className="chat-sidebar__name">{chat.name}</div>
                    <div className="chat-sidebar__last-message">
                      {chat.lastMessage}
                    </div>
                  </section>
                  <section className="chat-sidebar__time">10:30</section>
                  <button
                    type="button"
                    className="chat-sidebar__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatDelete && onChatDelete(chat.chatId);
                    }}
                    aria-label={`Ta bort chatt med ${chat.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            "Inga chattar hittades"
          )}
        </main>
      </div>
    </>
  );
}
export { ChatSidebar };
