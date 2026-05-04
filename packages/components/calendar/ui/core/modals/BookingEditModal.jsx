import { useEffect, useState } from "react";
import { format } from "date-fns";
import ZoTimePicker from "@zoplanner/time-picker";
import { ModalOverlay } from "@zoplanner/activity-creation";

const initialForm = {
  date: "",
  startTime: "",
  endTime: "",
  description: "",
};

function toInitialForm(eventItem) {
  const start = eventItem?.start ? new Date(eventItem.start) : null;
  const end = eventItem?.end ? new Date(eventItem.end) : null;

  return {
    date: start ? format(start, "yyyy-MM-dd") : "",
    startTime: start ? format(start, "HH:mm") : "",
    endTime: end ? format(end, "HH:mm") : "",
    description: eventItem?.description || eventItem?.subtitle || "",
  };
}

export default function BookingEditModal({
  isOpen,
  event,
  onClose,
  onSave,
  onDelete,
}) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!isOpen || !event) return;
    setFormData(toInitialForm(event));
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  function handleChange(changeEvent) {
    const { name, value } = changeEvent.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const start = new Date(`${formData.date}T${formData.startTime}:00`);
    const end = new Date(`${formData.date}T${formData.endTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    if (end <= start) return;

    onSave?.({
      ...formData,
      start,
      end,
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="scheduler-modal-header">
        <h2>Redigera bokning</h2>
        <button className="scheduler-close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="scheduler-activity-form">
        <div className="scheduler-form-group">
          <label htmlFor="booking-date">Datum *</label>
          <input
            id="booking-date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="scheduler-form-row">
          <ZoTimePicker
            label="Starttid *"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
          <ZoTimePicker
            label="Sluttid *"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="scheduler-form-group">
          <label htmlFor="booking-description">Beskrivning</label>
          <textarea
            id="booking-description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Lägg till beskrivning..."
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
          <button
            type="button"
            className="scheduler-btn-cancel"
            onClick={() => onDelete?.(event)}
          >
            Ta bort
          </button>
          <button type="submit" className="scheduler-btn-submit">
            Spara
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
