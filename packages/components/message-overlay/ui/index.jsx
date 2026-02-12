import { Button } from "@zoplanner/button";
import "./index.css"
function MessageOverlay({ message, onClose,status }) {
  return (
    <div className="messageOverlay-container">
        <div className="messageOverlay-content">
            <header className="messageOverlay-content-header">
                <h2>
                    {status =="recieved"?message.sender:message.recipient}
                </h2>
                <Button text={"×"} onClick={()=>onClose()} type={"button"} style={"close-btn"}/>
            </header>
            <main className="messageOverlay-main">
                <header className="messageOverlay-main-header">
                    <h3>{message.subject}</h3>
                    <p>{message.createdAt}</p>
                </header>
                <section>
                    {message.text}
                </section>
            </main>
            <footer className="messageOverlay-footer">
                <Button text={"Delete"} type={"button"} style={"delete-btn"}/>
              {status === "recieved" && <Button text={"Reply"} type={"button"} style={"reply-btn"}/>}
            </footer>
        </div>
    </div>
  );
}

export { MessageOverlay };