// Publika exporter för @zoplanner/calendar.
//
// Externa paket SKA endast importera från denna fil – inte från djupa interna
// sökvägar. Det gör att kalenderns interna struktur kan förändras utan att
// resten av appen påverkas.

// Schedulers (huvud-vyer)
export { DashboardScheduler } from "./dashboard/DashboardScheduler";
export { AllSchedulesScheduler } from "./all-schedules/AllSchedulesScheduler";

// Modaler (för återanvändning på t.ex. profil-sidan)
export { default as ActivityModal } from "./core/ui/modals/ActivityModal";
export { default as EventDetailsModal } from "./core/ui/modals/EventDetailsModal";
export { default as BookingEditModal } from "./core/ui/modals/BookingEditModal";

// Hooks som används av sidor utanför kalendern
export { default as useActivityForm } from "./core/hooks/useActivityForm";

// Datum-/tidshjälpare
export { toLocalDateTime } from "./core/utils/dateTimeUtils";

// Färgtema för aktiviteter (används bl.a. av månadssidopanelen)
export {
  ACTIVITY_COLOR_OPTIONS,
  DEFAULT_ACTIVITY_COLOR,
  normalizeActivityColor,
} from "./core/utils/eventColors";
