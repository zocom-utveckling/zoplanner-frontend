import { useEffect } from "react";

// Backdrop + click-outside/Escape. Innehåller ingen innehållsruta — för det
// används <Modal.Content>. Modaler som har sin egen ruta (t.ex.
// RequestActivityModal) hoppar bara över <Modal.Content>.
function Modal({
  onClose,
  children,
  closeOnEscape = false,
}) {
  useEffect(() => {
    if (!closeOnEscape) return undefined;

    function handleKeydown(keyboardEvent) {
      if (keyboardEvent.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [closeOnEscape, onClose]);

  function handleOverlayClick(overlayEvent) {
    if (overlayEvent.target === overlayEvent.currentTarget) {
      onClose?.();
    }
  }

  return (
    <div className="scheduler-modal-overlay" onClick={handleOverlayClick}>
      {children}
    </div>
  );
}

// Standard innehållsruta — vit kort med role/aria och stop-propagation
// så klick inuti inte stänger modalen.
function ModalContent({ role, ariaLabel, children }) {
  return (
    <div
      className="scheduler-modal-content"
      role={role}
      aria-modal={role === "dialog" ? "true" : undefined}
      aria-label={ariaLabel}
      onClick={(contentEvent) => contentEvent.stopPropagation()}
    >
      {children}
    </div>
  );
}

Modal.Content = ModalContent;

export default Modal;
