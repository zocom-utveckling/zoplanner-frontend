import "./index.css";

function ChatSidebar({ chats, selectedChat, onChatSelect, onChatDelete }){
    return(
        <>
        <div className="chats-container">
            <header>
                Inbox
            </header>
            <main>
                {
                    chats && chats.length > 0? <div>
                        {chats.map((chat)=>
                        <div className={`chat ${selectedChat?.chatId === chat.chatId ? 'active' : ''}`} key={chat.chatId} onClick={() => onChatSelect && onChatSelect(chat)}>
                            <section className="profilBild">{chat.name.split(' ').map(n => n[0]).join('')}</section>
                            <section className="names">
                                <div className="chats-name">{chat.name}</div>
                                <div className="last-message">{chat.lastMessage}</div>
                            </section>
                            <section className="time">10:30</section>
                            <button
                                type="button"
                                className="chat-delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChatDelete && onChatDelete(chat.chatId);
                                }}
                                aria-label={`Ta bort chatt med ${chat.name}`}
                            >
                                ×
                            </button>
                        </div>
                        )}

                    </div>:"Inga chattar hittades"
                }
            </main>
        </div>
        </>
    )

}
export {ChatSidebar}