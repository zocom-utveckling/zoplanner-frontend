import { useEffect } from "react";

// Delad overlay för kalenderns modaler. Sköter bakgrunden, innehållsrutan,
// stäng-vid-klick-utanför och (om closeOnEscape) Escape-stängning. Modaler
// skickas in som children och slipper hantera detta själva.
//
// Specialfall: vissa modaler (t.ex. RequestActivityModal) har egen innehålls-
// ruta — sätt då renderContentWrapper={false} så renderar overlayen bara
// bakgrunden.
export default function ModalOverlay({
  onClose,
  children,
  closeOnEscape = false,
  role,
  ariaLabel,
  renderContentWrapper = true,
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

  if (!renderContentWrapper) {
    return (
      <div className="scheduler-modal-overlay" onClick={handleOverlayClick}>
        {children}
      </div>
    );
  }

  return (
    <div className="scheduler-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="scheduler-modal-content"
        role={role}
        aria-modal={role === "dialog" ? "true" : undefined}
        aria-label={ariaLabel}
        onClick={(contentEvent) => contentEvent.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
