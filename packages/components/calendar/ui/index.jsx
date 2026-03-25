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
    initialView: monthOnly && !allSchedules ? "month" : "week",
    lockedView: monthOnly && !allSchedules ? "month" : null,
  });
  const { events, loading, addEvent, removeEvent } = useSchedulerEvents(user, {
    includeAllConsultants: allSchedules,
    onlyBookedPasses: allSchedules,
  });
  const { filters, filterOptions, filteredEvents, handleFilterChange } =
    useSchedulerFilters(events, {
      defaultPeriod: allSchedules ? "today" : "all",
      defaultSortBy: "name-asc",
      navigationDate: focusDate,
      navigationView: view,
      useNavigationPeriod: allSchedules,
    });
  const availableViews = useMemo(
    () => (monthOnly && !allSchedules ? ["month"] : ["day", "week", "month"]),
    [monthOnly, allSchedules],
  );
  const showFilters = monthOnly || allSchedules;
  const { selectedEvent, handleOpenEventModal, handleCloseEventModal } =
    useEventDetailsModal();
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
        focusDate={focusDate}
        view={view}
        setView={setView}
        allSchedules={allSchedules}
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
        filters={filters}
        loading={loading}
        monthOnly={monthOnly}
        allSchedules={allSchedules}
        onEventClick={handleOpenEventModal}
        onDayClick={handleOpenActivityModal}
        onFocusDateChange={setFocusDate}
      />

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
