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
    <div className="consultant-invite-modal__overlay">
      <div className="consultant-invite-modal__content">
        <h2 className="consultant-invite-modal__title">Bjud in konsult</h2>

        <form onSubmit={handleSubmit} className="consultant-invite-modal__body">
          <input
            type="email"
            placeholder="Ange e-postadress"
            className="consultant-invite-modal__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="consultant-invite-modal__actions">
            <button
              type="button"
              className="consultant-invite-modal__btn"
              onClick={onClose}
            >
              Avbryt
            </button>

            <button
              type="submit"
              className="consultant-invite-modal__btn consultant-invite-modal__btn--primary"
            >
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
