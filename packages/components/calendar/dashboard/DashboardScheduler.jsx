import { useState } from "react";
import { format } from "date-fns";
import "./DashboardScheduler.css";
import DashboardTopbar from "./DashboardTopbar";
import DashboardCalendarContent from "./DashboardCalendarContent";
import {
  ActivityModal,
  ModalOverlay,
  useActivityForm,
} from "@zoplanner/activity-creation";
import EventDetailsModal from "../core/ui/modals/EventDetailsModal";
import BookingEditModal from "../core/ui/modals/BookingEditModal";
import useSchedulerNavigation from "../core/hooks/useSchedulerNavigation";
import useEventDetailsModal from "../core/hooks/useEventDetailsModal";
import useSchedulerEvents from "../core/hooks/useSchedulerEvents";
import useSchedulerFilters from "../core/hooks/useSchedulerFilters";
import useCrossCalendarSync from "../core/hooks/useCrossCalendarSync";
import { emitActivitiesUpdated } from "../core/utils/activityEvents";
import {
  resolveAssignmentMeta,
  resolveSessionMeta,
} from "../core/utils/bookingMeta";
import { assignmentService, sessionService } from "@zoplanner/api";
import "../core/index.css";
import RequestActivityModal from "@zoplanner/planning-tool/ui/RequestActivityModal";

export function DashboardScheduler({ user, calendarUser, managerUser }) {
  const [bookingWeekColors, setBookingWeekColors] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

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

  // Bestäm vem som agerar (manager/medarbetare) och vad de får göra.
  const actorRole =
    typeof managerUser?.role === "string"
      ? managerUser.role.trim().toUpperCase()
      : typeof user?.role === "string"
        ? user.role.trim().toUpperCase()
        : "";
  const canManageBookingActions = ["MANAGER", "BOTH"].includes(actorRole);

  // En events-hook för "kalender-användaren" (eller den inloggade om ingen är vald).
  const { events, loading, addEvent, updateEvent, removeEvent } =
    useSchedulerEvents(calendarUser || user);

  // En till för manager-kalendern. Hooks får inte vara villkorliga, så vi anropar
  // alltid – är det inte aktuellt blir den helt enkelt en tom kalender.
  const {
    addEvent: managerAddEvent,
    updateEvent: managerUpdateEvent,
    removeEvent: managerRemoveEvent,
  } = useSchedulerEvents(managerUser);

  // All korskalender-logik (skapa/uppdatera/radera på båda samtidigt) bor här.
  const {
    isManagerManagingOther,
    handleCreateEventForBothUsers,
    handleUpdateEventForBothUsers,
    handleDeleteEventForBothUsers,
  } = useCrossCalendarSync({
    user,
    calendarUser,
    managerUser,
    addEvent,
    updateEvent,
    removeEvent,
    managerAddEvent,
    managerUpdateEvent,
    managerRemoveEvent,
  });

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
    onCreateEvent: handleCreateEventForBothUsers,
    onDeleteEvent: handleDeleteEventForBothUsers,
    onUpdateEvent: handleUpdateEventForBothUsers,
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

  function handleEventDrop(eventId, newStart, newEnd) {
    const event = filteredEvents.find((e) => String(e.id) === String(eventId));
    if (!event || event.source !== "activity") return;
    handleUpdateEventForBothUsers({ ...event, start: newStart, end: newEnd });
  }

  function handleEventClick(eventItem) {
    if (eventItem.isRequest) {
      setSelectedRequest(eventItem);
      return;
    }

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
          emitActivitiesUpdated(calendarUser?.id || user?.id);
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
          emitActivitiesUpdated(calendarUser?.id || user?.id);
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

      emitActivitiesUpdated(calendarUser?.id || user?.id);
      setBookingToEdit(null);
    } catch {
      // no-op
    }
  }

  return (
    <main className="dashboard-scheduler">
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
        targetUserName={
          isManagerManagingOther
            ? calendarUser.name || calendarUser.username
            : undefined
        }
      />

      <EventDetailsModal
        event={selectedEvent}
        onClose={handleCloseEventModal}
        userRole={user?.role}
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

      {selectedRequest ? (
        <ModalOverlay
          onClose={() => setSelectedRequest(null)}
          renderContentWrapper={false}
        >
          <RequestActivityModal
            activity={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onUpdate={(id, newTitle) => {
              updateEvent({ ...selectedRequest, id, title: newTitle });
            }}
          />
        </ModalOverlay>
      ) : null}
    </main>
  );
}
