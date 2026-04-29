import { useState } from "react";
import "./index.css";

function AddActivityButton({ onSubmit }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "meeting",
  });

  const handleAddActivity = () => {
    setSubmitError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setSubmitError("");
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setIsSubmitting(true);

    const normalizedFormData = {
      ...formData,
      title: formData?.title?.trim() || "Aktivitet",
    };

    try {
      if (onSubmit) {
        // `onSubmit` kan just nu spara lokalt även om backend misslyckas.
        // Därför används `false` bara när själva frontend-flödet inte kunde
        // skapa/spara aktiviteten överhuvudtaget.
        const wasSaved = await onSubmit(normalizedFormData);
        if (wasSaved === false) {
          setSubmitError("Kunde inte spara aktivitet i databasen.");
          return;
        }
      }

      // Vid lyckad submit återställer vi formuläret och stänger modalen,
      // oavsett om sparningen gick till backend eller till lokal fallback.
      setFormData({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        type: "meeting",
      });
      setIsModalOpen(false);
    } catch {
      setSubmitError("Kunde inte spara aktivitet i databasen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button className="add-activity-btn" onClick={handleAddActivity}>
        <span className="add-activity-btn__icon">+</span> Lägg till aktivitet
      </button>

      {isModalOpen && (
        <div className="add-activity-modal" onClick={handleCloseModal}>
          <div
            className="add-activity-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="add-activity-modal__header">
              <h2>Lägg till aktivitet</h2>
              <button
                className="add-activity-modal__close-btn"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="add-activity-modal__form">
              <div className="add-activity-modal__field-group">
                <label htmlFor="title">Titel</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="T.ex. Möte med kursledare"
                />
              </div>

              <div className="add-activity-modal__field-group">
                <label htmlFor="type">Typ av aktivitet *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="meeting">Möte</option>
                  <option value="lecture">Lektion</option>
                  <option value="review">Granskning</option>
                  <option value="preparation">Förberedelse</option>
                  <option value="other">Annat</option>
                </select>
              </div>

              <div className="add-activity-modal__field-group">
                <label htmlFor="date">Datum *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="add-activity-modal__row">
                <div className="add-activity-modal__field-group">
                  <label htmlFor="startTime">Starttid *</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="add-activity-modal__field-group">
                  <label htmlFor="endTime">Sluttid *</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="add-activity-modal__field-group">
                <label htmlFor="description">Beskrivning</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Lägg till eventuella anteckningar..."
                />
              </div>

              <div className="add-activity-modal__actions">
                <button
                  type="button"
                  className="add-activity-modal__cancel-btn"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="add-activity-modal__submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sparar..." : "Lägg till"}
                </button>
              </div>

              {submitError ? (
                <p className="add-activity-modal__error" role="alert">
                  {submitError}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export { AddActivityButton };
