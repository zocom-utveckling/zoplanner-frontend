import "./index.css";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Radera",
  cancelLabel = "Avbryt",
}) {
  if (!isOpen) return null;

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onCancel?.();
    }
  }

  return (
    <div className="course-details-modal__overlay" onClick={handleOverlayClick}>
      <div
        className="course-details-modal__content confirm-modal__content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="course-details-modal__header">
          <div>
            <h2 className="course-details-modal__title">{title}</h2>
          </div>
          <button
            className="course-details-modal__close"
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="confirm-modal__body">
          <p className="confirm-modal__message">{message}</p>
        </div>

        <div className="course-details-modal__actions confirm-modal__actions">
          <button
            type="button"
            className="course-details-modal__secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="course-details-modal__delete"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
