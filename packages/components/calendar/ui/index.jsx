import Topbar from "./Topbar";
import TimeGridView from "./TimeGridView";
import MonthView from "./MonthView";
import ActivityModal from "./modals/ActivityModal";
import EventDetailsModal from "./modals/EventDetailsModal";
import useSchedulerNavigation from "../hooks/useSchedulerNavigation";
import useActivityForm from "../hooks/useActivityForm";
import useEventDetailsModal from "../hooks/useEventDetailsModal";
import useSchedulerEvents from "../hooks/useSchedulerEvents";
import useSchedulerFilters from "../hooks/useSchedulerFilters";
import "./index.css";

export default function Scheduler({ user, monthOnly = false, allSchedules = false }) {
  const {
    view,
    setView,
    focusDate,
    setFocusDate,
    weekDays,
    monthGridDays,
    title,
    goToday,
    goPrev,
    goNext,
  } = useSchedulerNavigation({
    initialView: monthOnly ? "month" : "week",
    lockedView: monthOnly ? "month" : null,
  });
  const { events, loading, addEvent, removeEvent } = useSchedulerEvents(user, {
    includeAllConsultants: allSchedules,
  });
  const { filters, filterOptions, filteredEvents, handleFilterChange } =
    useSchedulerFilters(events);
  const {
    selectedEvent,
    handleOpenEventModal,
    handleCloseEventModal,
  } = useEventDetailsModal();
  const {
    isActivityModalOpen,
    activityFormData,
    handleOpenActivityModal,
    handleCloseActivityModal,
    handleActivityChange,
    handleActivitySubmit,
  } = useActivityForm({
    onDateSelected: setFocusDate,
    onCreateEvent: addEvent,
  });

  function handleDeleteEvent(eventToDelete) {
    if (!eventToDelete?.id) return;
    removeEvent(eventToDelete.id);
    handleCloseEventModal();
  }

  function handleEditEvent() {
    handleCloseEventModal();
  }

  return (
    <main className="main">
      <Topbar
        title={title}
        view={view}
        setView={setView}
        availableViews={monthOnly ? ["month"] : ["day", "week", "month"]}
        showFilters={monthOnly || allSchedules}
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={handleFilterChange}
        onGoToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
      />

      <div className="content-card">
        {view === "day" && (
          <TimeGridView
            days={[focusDate]}
            events={filteredEvents}
            onEventClick={handleOpenEventModal}
          />
        )}
        {view === "week" && (
          <TimeGridView
            days={weekDays}
            events={filteredEvents}
            onEventClick={handleOpenEventModal}
          />
        )}
        {view === "month" && (
          <MonthView
            monthGridDays={monthGridDays}
            focusDate={focusDate}
            events={filteredEvents}
            onDayClick={handleOpenActivityModal}
            onEventClick={handleOpenEventModal}
            showBookedPerson={monthOnly}
            deduplicateConsultantsPerDay={allSchedules}
          />
        )}
        {loading && filteredEvents.length === 0 ? (
          <div style={{ padding: "12px", color: "var(--text-muted)" }}>
            Laddar kalender...
          </div>
        ) : null}
      </div>

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={handleCloseActivityModal}
        formData={activityFormData}
        onChange={handleActivityChange}
        onSubmit={handleActivitySubmit}
      />

      <EventDetailsModal
        event={selectedEvent}
        onClose={handleCloseEventModal}
        userRole={user?.role}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </main>
  );
}
