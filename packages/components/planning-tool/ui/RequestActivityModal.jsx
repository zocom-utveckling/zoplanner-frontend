import { useState } from "react";
import { format } from "date-fns";
import "./index.css";

export default function RequestActivityModal({ activity, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!activity) return null;

  const cleanTitle = activity.title.replace(/^Godkänd: |^Avböjd: /, "");

  async function handleResponse(accepted) {
    setIsLoading(true);

    const newTitle = accepted
      ? `Godkänd: ${cleanTitle}`
      : `Avböjd: ${cleanTitle}`;

    try {
      onUpdate?.(activity.id, newTitle);

      onClose?.();
    } catch (error) {
      console.error("Failed to update activity:", error);
      alert("Kunde inte uppdatera förfrågan.");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div
      className="scheduler-modal-content request-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <h3 className="request-modal__title">{cleanTitle}</h3>

      <p className="request-modal__text">
        {activity.description || "Förfrågan om ändring av pass."}
      </p>

      <p className="request-modal__time">
        {format(activity.start, "HH:mm")} – {format(activity.end, "HH:mm")}
      </p>

      <div className="request-modal__actions">
        <button
          className="request-modal__button request-modal__button--accept"
          onClick={() => handleResponse(true)}
          disabled={isLoading}
        >
          Godkänn
        </button>

        <button
          className="request-modal__button request-modal__button--decline"
          onClick={() => handleResponse(false)}
          disabled={isLoading}
        >
          Avböj
        </button>

        <button
          className="request-modal__button request-modal__button--close"
          onClick={onClose}
          disabled={isLoading}
        >
          Stäng
        </button>
      </div>
    </div>
  );
}
