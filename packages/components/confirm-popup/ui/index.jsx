import { Button } from "@zoplanner/button";
import "./index.css";

function ConfirmPopup({ text, onConfirm, onCancel }) {
  return (
    <div className="confirm-popup__overlay">
      <div className="confirm-popup">
        <h2>{text}</h2>
        <p>Denna åtgärd kan inte ångras.</p>

        <div className="confirm-popup__actions">
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            text="Bekräfta"
            style="reply-btn"
          />

          <Button
            type="button"
            onClick={onCancel}
            text="Avbryt"
            style="delete-btn"
          />
        </div>
      </div>
    </div>
  );
}

export { ConfirmPopup };