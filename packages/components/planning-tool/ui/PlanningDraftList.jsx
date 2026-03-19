import { useState } from "react";

export default function PlanningDraftList({
  drafts,
  onSelect,
  selectedDraftId,
  removePlanningDraft,
}) {
  if (!drafts.length) {
    return <p> Inga sparade scheman</p>;
  }

  const [localDrafts, setLocalDrafts] = useState(drafts);

  function handleDelete(id) {
    removePlanningDraft(id);

    setLocalDrafts((prev) => prev.filter((draft) => draft.id !== id));
  }

  return (
    <div className="planning-draft-list">
      <h3>Utkast</h3>

      {localDrafts.map((draft) => {
        const isSelected = draft.id === selectedDraftId;
        return (
          <div
            key={draft.id}
            className={`planning-draft-item ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect(draft)}
          >
            <div className="draft-main">
              {draft.courseName || "Namnlös kurs"}
            </div>

            <div className="draft-meta">
              {draft.startDate}
              {draft.endDate ? ` - ${draft.endDate}` : ""}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(draft.id);
              }}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
