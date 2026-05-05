// Publika exporter för @zoplanner/calendar.
//
// Externa paket SKA endast importera från denna fil – inte från djupa interna
// sökvägar. Det gör att kalenderns interna struktur kan förändras utan att
// resten av appen påverkas.

// Schedulers (huvud-vyer)
export { DashboardScheduler } from "./ui/dashboard/DashboardScheduler";
export { AllSchedulesScheduler } from "./ui/all-schedules/AllSchedulesScheduler";

// Modaler (för återanvändning på t.ex. profil-sidan)
export { default as EventDetailsModal } from "./ui/core/modals/EventDetailsModal";
export { default as BookingEditModal } from "./ui/core/modals/BookingEditModal";

// Datum-/tidshjälpare
export { toLocalDateTime } from "./ui/core/utils/dateTimeUtils";

// Event-bus så externa konsumenter (t.ex. sidebar) kan signalera att
// aktiviteter förändrats utan att skriva egna dispatchEvent-anrop.
export {
  ACTIVITIES_UPDATED_EVENT,
  emitActivitiesUpdated,
} from "./ui/core/utils/activityEvents";

// OBS: Allt som handlar om att skapa/redigera en aktivitet (ActivityModal,
// useActivityForm, MonthCalendar, AddActivityButton, färgpaletten)
// bor i @zoplanner/activity-creation.
