import "./index.css";

function ConfirmPopup({ text, onConfirm, onCancel }) {
  return (
    <div className="confirm-popup__overlay">
      <div className="confirm-popup__backdrop">
        <h2>{text}</h2>
        <p>Denna åtgärd kan inte ångras.</p>

        <div className="confirm-popup__actions">
          <button
            type="button"
            className="button button_reply-btn"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            Bekräfta
          </button>

          <button
            type="button"
            className="button button_delete-btn"
            onClick={onCancel}
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
}

export { ConfirmPopup };
