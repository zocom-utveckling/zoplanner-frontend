import "./confirmModal.css";

function ConfirmModal({
  isOpen,
  message,
  confirmText = "Ja",
  cancelText = "Avbryt",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="messages-confirm-modal__overlay">
      <div className="messages-confirm-modal__content">
        <p>{message}</p>
        <div className="messages-confirm-modal__buttons">
          <button
            onClick={onCancel}
            className="messages-confirm-modal__btn-cancel"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="messages-confirm-modal__btn-confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export { ConfirmModal };
