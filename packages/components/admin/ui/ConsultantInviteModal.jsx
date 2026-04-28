import "./index.css";
import { useState } from "react";

export function ConsultantInviteModal({ isOpen, onClose, onSubmit }) {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="modal">
      <div className="modal__content">
        <h2 className="modal__title">Bjud in konsult</h2>

        <form onSubmit={handleSubmit} className="modal__body">
          <input
            type="email"
            placeholder="Ange e-postadress"
            className="modal__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="modal__actions">
            <button type="button" className="modal__btn" onClick={onClose}>
              Avbryt
            </button>

            <button type="submit" className="modal__btn modal__btn--primary">
              Skicka
            </button>
          </div>
          <p className="customer-registry__modal-future-note">
            Tanken är att en inbjudningslänk skickas till konsulten, där kontot
            skapas. Backendstöd saknas i dagsläget. För demo navigerar den här
            till registreringssidan som konsulten ska nå med länken.
          </p>
        </form>
      </div>
    </div>
  );
}
