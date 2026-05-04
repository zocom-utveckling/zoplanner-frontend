import "./AllSchedulesScheduler.css";
import { useState } from "react";
import { format } from "date-fns";
import AllSchedulesTopbar from "./AllSchedulesTopbar";
import AllSchedulesCalendarContent from "./AllSchedulesCalendarContent";
import ActivityModal from "../core/ui/modals/ActivityModal";
import EventDetailsModal from "../core/ui/modals/EventDetailsModal";
import BookingEditModal from "../core/ui/modals/BookingEditModal";
import useSchedulerNavigation from "../core/hooks/useSchedulerNavigation";
import useActivityForm from "../core/hooks/useActivityForm";
import useEventDetailsModal from "../core/hooks/useEventDetailsModal";
import useSchedulerEvents from "../core/hooks/useSchedulerEvents";
import useSchedulerFilters from "../core/hooks/useSchedulerFilters";
import { emitActivitiesUpdated } from "../core/utils/activityEvents";
import {
  resolveAssignmentMeta,
  resolveSessionMeta,
} from "../core/utils/bookingMeta";
import { useCurrentActor } from "@zoplanner/app-hooks";
import { assignmentService, sessionService } from "@zoplanner/api";
import "../core/index.css";

export function AllSchedulesScheduler({ user }) {
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const { canAccess, access, isLoadingActor } = useCurrentActor(user);
  const canOpenSchedule = canAccess(access.SCHEDULE);
  const normalizedRole =
    typeof user?.role === "string" ? user.role.trim().toUpperCase() : "";
  const canManageBookingActions = ["MANAGER", "BOTH"].includes(normalizedRole);

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

  if (isLoadingActor) {
    return <main className="all-schedules-scheduler">Laddar...</main>;
  }

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
    if (!canManageBookingActions) {
      handleCloseEventModal();
      return;
    }

    if (!eventToDelete?.id) return;

    const parsedSession = resolveSessionMeta(eventToDelete);
    const parsedAssignment = resolveAssignmentMeta(eventToDelete);

    if (parsedSession?.sessionId) {
      const confirmed = window.confirm(
        "Är du säker på att du vill ta bort den här bokningen?",
      );
      if (!confirmed) return;

      sessionService
        .remove(parsedSession.sessionId)
        .then(() => {
          emitActivitiesUpdated(user?.id);
          handleCloseEventModal();
          setBookingToEdit(null);
        })
        .catch(() => {
          // no-op
        });
      return;
    }

    if (parsedAssignment?.assignmentId) {
      const confirmed = window.confirm(
        "Är du säker på att du vill ta bort den här bokningen?",
      );
      if (!confirmed) return;

      assignmentService
        .remove(parsedAssignment.assignmentId)
        .then(() => {
          emitActivitiesUpdated(user?.id);
          handleCloseEventModal();
          setBookingToEdit(null);
        })
        .catch(() => {
          // no-op
        });
      return;
    }

    removeEvent(eventToDelete.id);
    handleCloseEventModal();
  }

  function handleEditEvent(eventToEdit) {
    if (!canManageBookingActions) {
      handleCloseEventModal();
      return;
    }

    const parsedSession = resolveSessionMeta(eventToEdit);
    const parsedAssignment = resolveAssignmentMeta(eventToEdit);
    if (parsedSession?.sessionId || parsedAssignment?.assignmentId) {
      setBookingToEdit(eventToEdit);
      handleCloseEventModal();
      return;
    }

    handleCloseEventModal();
  }

  async function handleSaveBookingEdit(nextValues) {
    if (!canManageBookingActions) {
      setBookingToEdit(null);
      return;
    }

    const parsedSession = resolveSessionMeta(bookingToEdit);
    const parsedAssignment = resolveAssignmentMeta(bookingToEdit);
    if (!parsedSession?.sessionId && !parsedAssignment?.assignmentId) return;

    try {
      if (parsedSession?.sessionId) {
        await sessionService.update(parsedSession.sessionId, {
          timeStart: format(nextValues.start, "yyyy-MM-dd HH:mm:ss"),
          timeEnd: format(nextValues.end, "yyyy-MM-dd HH:mm:ss"),
          comment: nextValues.description || "",
          location:
            bookingToEdit?.location ||
            bookingToEdit?.context?.location ||
            bookingToEdit?.locationType ||
            "ONSITE",
        });
      } else if (parsedAssignment?.assignmentId) {
        await assignmentService.update(parsedAssignment.assignmentId, {
          consultantId:
            bookingToEdit?.consultantId || bookingToEdit?.context?.consultantId,
          managerId:
            bookingToEdit?.managerId || bookingToEdit?.context?.managerId,
          courseId: bookingToEdit?.courseId || bookingToEdit?.context?.courseId,
          dateStart: format(nextValues.start, "yyyy-MM-dd"),
          dateEnd: format(nextValues.end, "yyyy-MM-dd"),
          description: nextValues.description || "",
          comment: nextValues.description || "",
        });
      }

      emitActivitiesUpdated(user?.id);
      setBookingToEdit(null);
    } catch {
      // no-op
    }
  }

  return (
    <main className="all-schedules-scheduler">
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
        canManageActions={canManageBookingActions}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      <BookingEditModal
        isOpen={Boolean(bookingToEdit)}
        event={bookingToEdit}
        onClose={() => setBookingToEdit(null)}
        onSave={handleSaveBookingEdit}
        onDelete={handleDeleteEvent}
      />
    </main>
  );
}
