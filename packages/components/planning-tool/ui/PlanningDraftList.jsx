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
          </div>
        );
      })}
    </div>
  );
}
