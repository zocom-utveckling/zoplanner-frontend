import { useState } from "react";
import "./DashboardScheduler.css";
import DashboardTopbar from "./DashboardTopbar";
import DashboardCalendarContent from "./DashboardCalendarContent";
import ActivityModal from "../core/ui/modals/ActivityModal";
import EventDetailsModal from "../core/ui/modals/EventDetailsModal";
import useSchedulerNavigation from "../core/hooks/useSchedulerNavigation";
import useActivityForm from "../core/hooks/useActivityForm";
import useEventDetailsModal from "../core/hooks/useEventDetailsModal";
import useSchedulerEvents from "../core/hooks/useSchedulerEvents";
import useSchedulerFilters from "../core/hooks/useSchedulerFilters";
import "../core/index.css";
import RequestActivityModal from "@zoplanner/planning-tool/ui/RequestActivityModal";

export function DashboardScheduler({ user, calendarUser, managerUser }) {
  const [bookingWeekColors, setBookingWeekColors] = useState(false);

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
  } = useSchedulerNavigation();

  const { events, loading, addEvent, updateEvent, removeEvent } =
    useSchedulerEvents(calendarUser || user);

  const { filteredEvents } = useSchedulerFilters(events, {
    defaultPeriod: "all",
    defaultSortBy: "name-asc",
    navigationDate: focusDate,
    navigationView: view,
    useNavigationPeriod: false,
  });

  const { selectedEvent, handleOpenEventModal, handleCloseEventModal } =
    useEventDetailsModal();

  const {
    isActivityModalOpen,
    activityFormData,
    activityModalMode,
    activityColorDirty,
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
  const [selectedRequest, setSelectedRequest] = useState(null);
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

  function handleEventDrop(eventId, newStart, newEnd) {
    const event = filteredEvents.find((e) => String(e.id) === String(eventId));
    if (!event || event.source !== "activity") return;
    updateEvent({ ...event, start: newStart, end: newEnd });
  }

  function handleEventClick(eventItem) {
    console.log("CLICKED EVENT:", eventItem);
    if (eventItem.isRequest) {
      setSelectedRequest(eventItem);
      console.log("SETTING selectedRequest");
      return;
    }

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
  console.log("selectedRequest:", selectedRequest);
  return (
    <main className="main">
      <DashboardTopbar
        title={title}
        view={view}
        setView={setView}
        onGoToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
        bookingWeekColors={bookingWeekColors}
        onToggleBookingWeekColors={() => setBookingWeekColors((v) => !v)}
        calendarUser={calendarUser}
        managerUser={managerUser}
      />

      <DashboardCalendarContent
        view={view}
        focusDate={focusDate}
        weekDays={weekDays}
        monthGridDays={monthGridDays}
        filteredEvents={filteredEvents}
        loading={loading}
        onEventClick={handleEventClick}
        onDayClick={handleOpenActivityModal}
        onEventDrop={handleEventDrop}
        bookingWeekColors={bookingWeekColors}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={handleCloseActivityModal}
        formData={activityFormData}
        mode={activityModalMode}
        colorDirty={activityColorDirty}
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
      {selectedRequest && (
        <div
          className="scheduler-modal-overlay"
          onClick={() => setSelectedRequest(null)}
        >
          <RequestActivityModal
            activity={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onUpdate={(id, newTitle) => {
              updateEvent({
                ...selectedRequest,
                id,
                title: newTitle,
              });
            }}
          />
        </div>
      )}
    </main>
  );
}
