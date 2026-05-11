// Publika exporter för @zoplanner/activity-creation.
//
// Detta paket är roten till allt som har med att skapa/redigera en aktivitet:
// - <AddActivityButton /> — knappen som triggar flödet från sidopanelen
// - <ActivityModal /> — den fullständiga modalen (skapa/redigera/visa)
// - useActivityForm — formulär-state-hook (create/edit/view)
// - Färgpaletten (ACTIVITY_COLOR_OPTIONS m.m.)
//
// Den delade modal-overlayen (compound) bor numera i @zoplanner/modal.
// Sidopanelens lilla månadskalender bor i @zoplanner/sidebar-mini-calendar och
// importerar färgpaletten härifrån.

export { AddActivityButton } from "./ui";

export { default as ActivityModal } from "./modals/ActivityModal";

export { default as useActivityForm } from "./hooks/useActivityForm";

export {
  ACTIVITY_COLOR_OPTIONS,
  DEFAULT_ACTIVITY_COLOR,
  normalizeActivityColor,
  getActivityColorTokens,
  getDashboardEventColorVars,
  getAllSchedulesEventColorVars,
  getBookingWeekdayColorVars,
} from "./utils/eventColors";
