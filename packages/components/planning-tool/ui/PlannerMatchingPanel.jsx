import {
  ConsultantMatchPanel,
  AssignmentSummaryCard,
  getClassName,
  getCourseName,
  getCustomerName,
  getEndDate,
  getStartDate,
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

  const courseName = getCourseName(courseDraft, "Kursschema");
  const customerName = getCustomerName(courseDraft);
  const className = getClassName(courseDraft);
  const startDate = getStartDate(courseDraft);
  const endDate = getEndDate(courseDraft);

  if (isAssigned) {
    return (
      <AssignmentSummaryCard
        customerName={customerName}
        courseName={courseName}
        className={className}
        consultantName={assignedConsultantName}
        startDate={startDate}
        endDate={endDate}
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
          <h2 className="consultant-match-panel__title">{courseName}</h2>
          <p className="consultant-match-panel__meta">
            {startDate || ""} – {endDate || ""}
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
