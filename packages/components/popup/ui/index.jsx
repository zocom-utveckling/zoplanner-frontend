import { useEffect } from "react";
import "./index.css";
function PopUp({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
      </div>
    </div>
  );
}

export {PopUp}