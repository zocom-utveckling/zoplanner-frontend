import { useState } from "react";
import { CourseSetupForm, getCourseName } from "@zoplanner/planning-tool";
import { useCustomers } from "@zoplanner/app-hooks";

export default function PlannerPlanningPanel({
  managerId,
  courseDraft,
  selectedAssignmentForMatching,
  isEditingBasicInfo,
  showBasicInfo,
  showScheduleEditor,
  setIsEditingBasicInfo,
  setShowScheduleEditor,
  setShowBasicInfo,
  setPlannerMode,
  setActiveAssignment,
  onSaveDraft,
  isSaving,
}) {
  const { customers, createCustomer } = useCustomers();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerCity, setNewCustomerCity] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      alert("Ange kundnamn.");
      return;
    }

    if (!managerId) {
      alert("Kunde inte skapa kund: managerId saknas.");
      return;
    }

    try {
      setIsCreatingCustomer(true);

      const newCustomer = await createCustomer({
        name: newCustomerName,
        city: newCustomerCity,
        managerId,
      });

      setNewCustomerName("");
      setNewCustomerCity("");
      setShowAddCustomer(false);
      setIsCreatingCustomer(false);

      if (newCustomer && courseDraft) {
        const updatedDraft = {
          ...courseDraft,
          customerId: String(newCustomer.id),
          customerName: newCustomer.name,
        };

        onSaveDraft?.(updatedDraft);
      }

      return newCustomer;
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("Kunde inte skapa kund.");
      setIsCreatingCustomer(false);
    }
  };

  return (
    <>
      <CourseSetupForm
        initialValues={courseDraft}
        lockBasicInfo={
          Boolean(selectedAssignmentForMatching) && !isEditingBasicInfo
        }
        showBasicInfo={showBasicInfo}
        showScheduleEditor={showScheduleEditor}
        onEditBasicInfo={() => setIsEditingBasicInfo(true)}
        onEditSchedule={() => setShowScheduleEditor(true)}
        onSave={onSaveDraft}
        customers={customers}
        onOpenAddCustomer={() => setShowAddCustomer(true)}
      />

      <button
        className="planner-planning-panel__action-btn"
        onClick={() => {
          console.log("🔘 primary click", courseDraft);

          if (!courseDraft?.sessionsDraft?.length) {
            console.log("📨 submitting form");
            document.querySelector(".course-setup-form")?.requestSubmit();
          } else {
            console.log("➡️ switching to matching");

            setActiveAssignment((previous) => ({
              ...previous,
              id: previous?.id ?? courseDraft.assignmentId ?? null,
              assignmentId:
                previous?.assignmentId ?? courseDraft.assignmentId ?? null,

              dateStart: courseDraft.startDate,
              dateEnd: courseDraft.endDate,
              course: {
                ...(previous?.course ?? {}),
                id: courseDraft.courseId ?? previous?.course?.id ?? null,
                name: getCourseName(courseDraft, "Kursschema"),
              },
              customerId:
                courseDraft.customerId ?? previous?.customerId ?? null,
              customerName:
                courseDraft.customerName ?? previous?.customerName ?? "",
              classId: courseDraft.classId ?? previous?.classId ?? null,
              className: courseDraft.className ?? previous?.className ?? "",
              sessions: courseDraft.sessionsDraft ?? [],
            }));

            setShowScheduleEditor(false);
            setShowBasicInfo(true);
            setPlannerMode("matching");
          }
        }}
        disabled={isSaving}
      >
        {isSaving
          ? "Sparar..."
          : courseDraft?.sessionsDraft?.length
            ? "Hitta konsult"
            : "Visa upplägg"}
      </button>

      {showAddCustomer && (
        <div className="planner-planning-panel__modal-overlay">
          <div className="planner-planning-panel__modal">
            <div className="planner-planning-panel__modal-header">
              <h3>Lägg till ny kund</h3>
              <button
                className="planner-planning-panel__modal-close"
                type="button"
                onClick={() => {
                  setShowAddCustomer(false);
                  setNewCustomerName("");
                  setNewCustomerCity("");
                }}
                aria-label="Stäng"
              >
                ✕
              </button>
            </div>

            <div className="planner-planning-panel__modal-content">
              <div className="planner-planning-panel__form-field">
                <label htmlFor="newCustomerName">Kundnamn *</label>
                <input
                  id="newCustomerName"
                  type="text"
                  placeholder="Ange kundnamn"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  disabled={isCreatingCustomer}
                />
              </div>

              <div className="planner-planning-panel__form-field">
                <label htmlFor="newCustomerCity">Stad</label>
                <input
                  id="newCustomerCity"
                  type="text"
                  placeholder="Ange stad"
                  value={newCustomerCity}
                  onChange={(e) => setNewCustomerCity(e.target.value)}
                  disabled={isCreatingCustomer}
                />
              </div>
            </div>

            <div className="planner-planning-panel__modal-actions">
              <button
                className="planner-planning-panel__modal-cancel"
                onClick={() => {
                  setShowAddCustomer(false);
                  setNewCustomerName("");
                  setNewCustomerCity("");
                }}
                disabled={isCreatingCustomer}
              >
                Avbryt
              </button>
              <button
                className="planner-planning-panel__modal-save"
                onClick={handleCreateCustomer}
                disabled={isCreatingCustomer || !newCustomerName.trim()}
              >
                {isCreatingCustomer ? "Skapar..." : "Skapa kund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
