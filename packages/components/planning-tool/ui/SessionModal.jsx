export default function SessionModal({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  mode = "edit",
  onDelete,
}) {
  if (!isOpen || !formData) return null;

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="scheduler-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="scheduler-modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="scheduler-modal-header">
          <h2>Redigera lektionstillfälle</h2>
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
              placeholder="T.ex. CSS - Pass 1"
            />
          </div>

          <div className="scheduler-form-group">
            <label htmlFor="date">Datum *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={onChange}
              required
            />
          </div>

          <div className="scheduler-form-row">
            <div className="scheduler-form-group">
              <label htmlFor="startTime">Starttid *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={onChange}
                required
              />
            </div>

            <div className="scheduler-form-group">
              <label htmlFor="endTime">Sluttid *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="scheduler-form-group">
            <label htmlFor="location">Plats *</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={onChange}
              required
            >
              <option value="ONSITE">På plats</option>
              <option value="REMOTE">Distans</option>
            </select>
          </div>

          <div className="scheduler-modal-actions">
            <button
              type="button"
              className="scheduler-btn-cancel"
              onClick={onClose}
            >
              Avbryt
            </button>

            {onDelete ? (
              <button
                type="button"
                className="scheduler-btn-cancel"
                onClick={onDelete}
              >
                Ta bort
              </button>
            ) : null}

            <button type="submit" className="scheduler-btn-submit">
              Spara
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
