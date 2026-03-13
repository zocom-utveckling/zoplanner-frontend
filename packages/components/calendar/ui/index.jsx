import Topbar from "./Topbar";
import CalendarContent from "./CalendarContent";
import ActivityModal from "./modals/ActivityModal";
import EventDetailsModal from "./modals/EventDetailsModal";
import useSchedulerNavigation from "../hooks/useSchedulerNavigation";
import useActivityForm from "../hooks/useActivityForm";
import useEventDetailsModal from "../hooks/useEventDetailsModal";
import useSchedulerEvents from "../hooks/useSchedulerEvents";
import useSchedulerFilters from "../hooks/useSchedulerFilters";
import { useMemo } from "react";
import "./index.css";

export default function Scheduler({
  user,
  monthOnly = false,
  allSchedules = false,
}) {
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
  const { events, loading, addEvent, updateEvent, removeEvent } =
    useSchedulerEvents(user, {
      includeAllConsultants: allSchedules,
    });
  const { filters, filterOptions, filteredEvents, handleFilterChange } =
    useSchedulerFilters(events);
  const availableViews = useMemo(
    () => (monthOnly ? ["month"] : ["day", "week", "month"]),
    [monthOnly],
  );
  const showFilters = monthOnly || allSchedules;
  const { selectedEvent, handleOpenEventModal, handleCloseEventModal } =
    useEventDetailsModal();
  const {
    isActivityModalOpen,
    activityFormData,
    activityModalMode,
    handleOpenActivityModal,
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
    return (
      eventItem?.source === "local" &&
      typeof eventItem?.id === "string" &&
      eventItem.id.startsWith("local-")
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
      <Topbar
        title={title}
        view={view}
        setView={setView}
        availableViews={availableViews}
        showFilters={showFilters}
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={handleFilterChange}
        onGoToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
      />

      <CalendarContent
        view={view}
        focusDate={focusDate}
        weekDays={weekDays}
        monthGridDays={monthGridDays}
        filteredEvents={filteredEvents}
        loading={loading}
        monthOnly={monthOnly}
        allSchedules={allSchedules}
        onEventClick={handleEventClick}
        onDayClick={handleOpenActivityModal}
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
