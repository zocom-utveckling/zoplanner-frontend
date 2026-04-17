import "./confirmModal.css";

function ConfirmModal({ isOpen, message, confirmText = "Ja", cancelText = "Avbryt", onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal">
                <p>{message}</p>
                <div className="confirm-modal-buttons">
                    <button onClick={onCancel} className="btn-cancel">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} className="btn-confirm">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export { ConfirmModal };
