import {
  ACTIVITY_COLOR_OPTIONS,
  DEFAULT_ACTIVITY_COLOR,
} from "../../utils/eventColors";
import ZoTimePicker from "@zoplanner/time-picker";

export default function ActivityModal({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  mode = "create",
  colorDirty = false,
  onStartEdit,
  onDelete,
  targetUserName,
}) {
  if (!isOpen) return null;

  const isViewMode = mode === "view";
  const selectedColor = formData.color || DEFAULT_ACTIVITY_COLOR;
  const submitLabel = mode === "edit" ? "Spara" : "Lägg till";
  const title = mode === "create" ? "Lägg till aktivitet" : "Aktivitet";

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleStartEditClick(event) {
    event.preventDefault();
    event.stopPropagation();
    onStartEdit?.();
  }

  return (
    <div className="scheduler-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="scheduler-modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="scheduler-modal-header">
          <div className="scheduler-modal-header__titles">
            <h2>{title}</h2>
            {targetUserName && mode === "create" ? (
              <p className="scheduler-modal-subtitle">för {targetUserName}</p>
            ) : null}
          </div>
          <button className="scheduler-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="scheduler-activity-form">
          <div className="scheduler-form-group">
            <label htmlFor="title">Titel</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={onChange}
              disabled={isViewMode}
              placeholder="T.ex. Möte med kursledare"
            />
          </div>

          <div className="scheduler-form-group">
            <label htmlFor="type">Typ av aktivitet *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={onChange}
              disabled={isViewMode}
              required
            >
              <option value="meeting">Möte</option>
              <option value="lecture">Lektion</option>
              <option value="review">Granskning</option>
              <option value="preparation">Förberedelse</option>
              <option value="other">Annat</option>
            </select>
          </div>

          <div className="scheduler-form-group">
            <label>Färg</label>
            <div className="scheduler-color-picker">
              {ACTIVITY_COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption.key}
                  type="button"
                  title={colorOption.label}
                  className={`scheduler-color-dot${selectedColor === colorOption.key ? " scheduler-color-dot--active" : ""}`}
                  style={{ "--dot-color": colorOption.accent }}
                  onClick={() =>
                    onChange({
                      target: { name: "color", value: colorOption.key },
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div className="scheduler-form-group">
            <label htmlFor="date">Datum *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={onChange}
              disabled={isViewMode}
              required
            />
          </div>

          <div className="scheduler-form-row">
            <ZoTimePicker
              label="Starttid *"
              name="startTime"
              value={formData.startTime}
              onChange={onChange}
              disabled={isViewMode}
              required
            />
            <ZoTimePicker
              label="Sluttid *"
              name="endTime"
              value={formData.endTime}
              onChange={onChange}
              disabled={isViewMode}
              required
            />
          </div>

          <div className="scheduler-form-group">
            <label htmlFor="description">Beskrivning</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onChange}
              disabled={isViewMode}
              rows="4"
              placeholder="Lägg till eventuella anteckningar..."
            />
          </div>

          <div className="scheduler-modal-actions">
            <button
              type="button"
              className="scheduler-btn-cancel"
              onClick={onClose}
            >
              Avbryt
            </button>
            {mode !== "create" ? (
              <button
                type="button"
                className="scheduler-btn-cancel"
                onClick={onDelete}
              >
                Ta bort
              </button>
            ) : null}
            {isViewMode ? (
              <button
                type="button"
                className="scheduler-btn-submit"
                onClick={colorDirty ? onClose : handleStartEditClick}
              >
                {colorDirty ? "Spara" : "Redigera"}
              </button>
            ) : (
              <button type="submit" className="scheduler-btn-submit">
                {submitLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
