import {
  ConsultantMatchPanel,
  AssignmentSummaryCard,
} from "@zoplanner/planning-tool";

export default function PlannerMatchingPanel({
  consultantsLoading,
  isAssigned,
  isLoadingConsultantSchedule,
  selectedConsultant,
  missingFinalInfo,
  setPlannerMode,
  courseDraft,
  consultants,
  onSelectConsultant,
  onBack,
  onConfirmConsultant,
  onFillInDetails,
  onEditFromFinal,
  assignedConsultantName,
  scheduleSummary,
  onExportPdf,
  onSendMessage,
}) {
  if (consultantsLoading) {
    return <p>Laddar konsulter...</p>;
  }

  if (isAssigned) {
    return (
      <AssignmentSummaryCard
        customerName={courseDraft?.customerName}
        courseName={courseDraft?.courseName}
        className={courseDraft?.className}
        consultantName={assignedConsultantName}
        startDate={courseDraft?.startDate}
        endDate={courseDraft?.endDate}
        scheduleSummary={scheduleSummary}
        onEditFromFinal={onEditFromFinal}
        onExportPdf={() => {
          console.log("PDF BUTTON CLICKED");
          onExportPdf?.();
        }}
        onSendMessage={() => {
          console.log("SEND MESSAGE CLICKED");
          onSendMessage?.();
        }}
      />
    );
  }

  return (
    <>
      <div className="consultant-match-panel__header">
        <div className="consultant-match-panel__header-main">
          <h2 className="consultant-match-panel__title">
            {courseDraft?.courseName || "Kursschema"}
          </h2>
          <p className="consultant-match-panel__meta">
            {courseDraft?.startDate || ""} – {courseDraft?.endDate || ""}
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            className="consultant-match-panel__back"
            onClick={onBack}
          >
            Redigera
          </button>
        )}
      </div>

      <div className="planner-match-actions">
        <p className="planner-match-actions__status">
          {isLoadingConsultantSchedule
            ? "Laddar konsultens befintliga schema..."
            : selectedConsultant
              ? `Visar schema för ${selectedConsultant.name}.`
              : "Välj en konsult för att förhandsvisa schemat."}
        </p>

        {selectedConsultant && missingFinalInfo.length > 0 && (
          <div className="planner-warning">
            Du måste ange {missingFinalInfo.join(", ")} innan du kan slutföra.
            <button className="planner-btn-secondary" onClick={onFillInDetails}>
              Fyll i uppgifter
            </button>
          </div>
        )}
      </div>

      <ConsultantMatchPanel
        assignment={{
          sessions: courseDraft?.sessionsDraft ?? [],
        }}
        consultants={consultants}
        selectedConsultantId={selectedConsultant?.id}
        onSelectConsultant={onSelectConsultant}
        onConfirmConsultant={onConfirmConsultant}
        confirmDisabled={missingFinalInfo.length > 0}
      />
    </>
  );
}
