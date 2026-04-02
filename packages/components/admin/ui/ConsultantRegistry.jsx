import { AllSchedulesScheduler } from "@zoplanner/calendar";

export function ConsultantRegistry({ user }) {
  if (!user) {
    return null;
  }

  return (
    <>
      <div className="consultant-registry__header">
        <h1>Konsulter</h1>
        <button type="button" className="consultant-registry__add-button">
          Lägg till konsult
        </button>
      </div>
      <AllSchedulesScheduler user={user} />
    </>
  );
}
