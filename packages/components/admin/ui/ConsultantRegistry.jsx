import { AllSchedulesScheduler } from "@zoplanner/calendar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConsultantInviteModal } from "./ConsultantInviteModal";
import { managerService } from "@zoplanner/api";

export function ConsultantRegistry({ user }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenInvite = () => setIsInviteOpen(true);
  const handleCloseInvite = () => setIsInviteOpen(false);

  const handleInviteSubmit = async (email) => {
    if (!user?.id) return;

    setIsInviteOpen(false);

    try {
      const managers = await managerService.getAll();

      const manager = managers.find((m) => m.userId === user.id);

      if (!manager) {
        alert("Hittade ingen manager kopplad till användaren");
        return;
      }

      const params = new URLSearchParams({
        managerId: manager.id,
        email,
      });

      navigate(`/consultant-onboarding?${params.toString()}`);
      // TODO: replace managerId/email query params with backend-generated invite token
      // navigate(`/consultant-onboarding?token=${inviteToken}`);
    } catch (err) {
      console.error(err);
      alert("Kunde inte hämta manager");
    }
  };

  return (
    <>
      <div className="consultant-registry__header">
        <h1>Konsulter</h1>
        <button
          type="button"
          onClick={handleOpenInvite}
          className="consultant-registry__add-button"
        >
          + Bjud in konsult
        </button>
      </div>
      <AllSchedulesScheduler user={user} />
      <ConsultantInviteModal
        isOpen={isInviteOpen}
        onClose={handleCloseInvite}
        onSubmit={handleInviteSubmit}
      />
    </>
  );
}
