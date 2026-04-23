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
  assignedConsultantName,
  scheduleSummary,
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
        onExportPdf={() => {}}
        onSendMessage={() => {}}
      />
    );
  }

  return (
    <>
      <div className="planner-match-actions">
        <p className="planner-match-actions__status">
          {isLoadingConsultantSchedule
            ? "Laddar konsultens befintliga schema..."
            : selectedConsultant
              ? `Visar schema för ${selectedConsultant.name}.`
              : "Välj en konsult för att förhandsvisa schemat."}
        </p>

        {missingFinalInfo.length > 0 && (
          <div className="planner-warning">
            Du måste ange {missingFinalInfo.join(", ")} innan du kan slutföra.
            <button
              className="planner-btn-secondary"
              onClick={() => setPlannerMode("planning")}
            >
              Fyll i uppgifter
            </button>
          </div>
        )}
      </div>

      <ConsultantMatchPanel
        assignment={{
          dateStart: courseDraft?.startDate,
          dateEnd: courseDraft?.endDate,
          course: {
            name: courseDraft?.courseName || "Kursschema",
          },
          sessions: courseDraft?.sessionsDraft ?? [],
        }}
        consultants={consultants}
        selectedConsultantId={selectedConsultant?.id}
        missingFinalInfo={missingFinalInfo}
        onCompleteMissingInfo={() => {
          setPlannerMode("planning");
        }}
        onSelectConsultant={onSelectConsultant}
        onBack={onBack}
        onConfirmConsultant={onConfirmConsultant}
      />
    </>
  );
}
