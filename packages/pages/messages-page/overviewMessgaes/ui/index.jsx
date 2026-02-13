function OverviewMessages({message,onClose,user}) {
    const senderName = message.sender === user.username ? message.recipient : message.recipient === user.username ? message.sender : "Unknown Sender";
  return (
    <div className="overview-messages-container">
        <div className="overview-messages-header">  
            <h2>{senderName}</h2>
            <h3 onClick={onClose}>X</h3>
        </div>
        <div className="overview-messages-content">
            <h3>{message.subject}</h3>
            <p>{message.message.text}</p>
            <span>{message.message.createdAt}</span>
            </div>
      
    </div>
  );
}

export { OverviewMessages };