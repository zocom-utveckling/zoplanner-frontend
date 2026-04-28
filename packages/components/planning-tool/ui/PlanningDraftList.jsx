export default function PlanningDraftList({
  drafts,
  onSelect,
  selectedDraftId,
}) {
  if (!drafts.length) {
    return <p> Inga sparade scheman</p>;
  }

  return (
    <div className="planning-draft-list">
      <h3>Utkast till scheman</h3>

      {drafts.map((draft) => {
        const isSelected = draft.id === selectedDraftId;
        return (
          <div
            key={draft.id}
            className={`planning-draft-item ${isSelected ? "planning-draft-item--selected" : ""}`}
            onClick={() => onSelect(draft)}
          >
            <div className="planning-draft-item__main">
              {draft.courseName || "Namnlös kurs"}
            </div>

            <div className="planning-draft-item__meta">
              {draft.startDate}
              {draft.endDate ? ` - ${draft.endDate}` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
