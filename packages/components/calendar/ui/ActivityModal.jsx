export default function ActivityModal({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="scheduler-modal-overlay" onClick={onClose}>
      <div
        className="scheduler-modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="scheduler-modal-header">
          <h2>Lägg till aktivitet</h2>
          <button className="scheduler-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="scheduler-activity-form">
          <div className="scheduler-form-group">
            <label htmlFor="title">Titel *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={onChange}
              required
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
            <label htmlFor="description">Beskrivning</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onChange}
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
            <button type="submit" className="scheduler-btn-submit">
              Lägg till
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
