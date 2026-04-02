import "./AllSchedulesScheduler.css";
import AllSchedulesTopbar from "./AllSchedulesTopbar";
import AllSchedulesCalendarContent from "./AllSchedulesCalendarContent";
import ActivityModal from "../core/ui/modals/ActivityModal";
import EventDetailsModal from "../core/ui/modals/EventDetailsModal";
import useSchedulerNavigation from "../core/hooks/useSchedulerNavigation";
import useActivityForm from "../core/hooks/useActivityForm";
import useEventDetailsModal from "../core/hooks/useEventDetailsModal";
import useSchedulerEvents from "../core/hooks/useSchedulerEvents";
import useSchedulerFilters from "../core/hooks/useSchedulerFilters";
import { useAccess } from "@zoplanner/app-hooks";
import "../core/index.css";

export function AllSchedulesScheduler({ user }) {
  const { canOpenSchedule } = useAccess(user);

  const {
    view,
    setView,
    focusDate,
    setFocusDate,
    weekDays,
    goToday,
    goPrev,
    goNext,
  } = useSchedulerNavigation();

  const { events, loading, addEvent, updateEvent, removeEvent } =
    useSchedulerEvents(user, {
      includeAllConsultants: canOpenSchedule,
      onlyBookedPasses: true,
    });

  const {
    filters,
    filterOptions,
    filteredEvents,
    handleFilterChange,
    consultantUsers,
  } = useSchedulerFilters(events, {
    defaultPeriod: "today",
    defaultSortBy: "name-asc",
    navigationDate: focusDate,
    navigationView: view,
    useNavigationPeriod: true,
  });

  const { selectedEvent, handleOpenEventModal, handleCloseEventModal } =
    useEventDetailsModal();

  const {
    isActivityModalOpen,
    activityFormData,
    activityModalMode,
    handleOpenActivityModalForEvent,
    handleCloseActivityModal,
    handleStartEditingActivity,
    handleDeleteActivity,
    handleActivityChange,
    handleActivitySubmit,
  } = useActivityForm({
    onDateSelected: setFocusDate,
    onCreateEvent: addEvent,
    onDeleteEvent: removeEvent,
    onUpdateEvent: updateEvent,
  });

  function isAddButtonActivity(eventItem) {
    const hasDatabaseId = Number.isFinite(Number(eventItem?.id));

    return (
      hasDatabaseId ||
      (eventItem?.source === "local" &&
        typeof eventItem?.id === "string" &&
        (eventItem.id.startsWith("local-") ||
          eventItem.id.startsWith("manual-")))
    );
  }

  function handleEventClick(eventItem) {
    if (isAddButtonActivity(eventItem)) {
      handleOpenActivityModalForEvent(eventItem);
      return;
    }

    handleOpenEventModal(eventItem);
  }

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
      <AllSchedulesTopbar
        focusDate={focusDate}
        view={view}
        setView={setView}
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onGoToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
      />

      <AllSchedulesCalendarContent
        view={view}
        focusDate={focusDate}
        weekDays={weekDays}
        filteredEvents={filteredEvents}
        allConsultants={consultantUsers}
        filters={filters}
        loading={loading}
        onEventClick={handleEventClick}
        onFocusDateChange={setFocusDate}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={handleCloseActivityModal}
        formData={activityFormData}
        mode={activityModalMode}
        onStartEdit={handleStartEditingActivity}
        onDelete={handleDeleteActivity}
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
