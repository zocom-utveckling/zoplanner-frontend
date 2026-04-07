import { AllSchedulesScheduler } from "@zoplanner/calendar";
import { useState } from "react";
import { ConsultantInviteModal } from "./ConsultantInviteModal";

export function ConsultantRegistry({ user }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const handleOpenInvite = () => setIsInviteOpen(true);
  const handleCloseInvite = () => setIsInviteOpen(false);
  const handleInviteSubmit = (email) => {
    if (!user?.id) return;

    setIsInviteOpen(false);

    const params = new URLSearchParams({
      managerId: user.id,
      email,
    });

    navigate(`/dev-register?${params.toString()}`);

    // TODO: replace with backend-generated invite token
    // navigate(`/dev-register?token=${inviteToken}`);
  };
  if (!user) {
    return null;
  }

  return (
    <>
      <div className="consultant-registry__header">
        <h1>Konsulter</h1>
        <button
          type="button"
          onClick={handleOpenInvite}
          className="consultant-registry__add-button"
        >
          Bjud in ny konsult
        </button>
      </div>
      <AllSchedulesScheduler user={user} />
      <ConsultantInviteModal
        isOpen={isInviteOpen}
        onClose={handleCloseInvite}
      />
    </>
  );
}
