import { useRef, useState } from "react";
import { format } from "date-fns";
import "./DashboardScheduler.css";
import DashboardTopbar from "./DashboardTopbar";
import DashboardCalendarContent from "./DashboardCalendarContent";
import ActivityModal from "../core/ui/modals/ActivityModal";
import EventDetailsModal from "../core/ui/modals/EventDetailsModal";
import BookingEditModal from "../core/ui/modals/BookingEditModal";
import useSchedulerNavigation from "../core/hooks/useSchedulerNavigation";
import useActivityForm from "../core/hooks/useActivityForm";
import useEventDetailsModal from "../core/hooks/useEventDetailsModal";
import useSchedulerEvents from "../core/hooks/useSchedulerEvents";
import useSchedulerFilters from "../core/hooks/useSchedulerFilters";
import {
  activityService,
  assignmentService,
  sessionService,
} from "@zoplanner/api";
import "../core/index.css";
import RequestActivityModal from "@zoplanner/planning-tool/ui/RequestActivityModal";

export function DashboardScheduler({ user, calendarUser, managerUser }) {
  const [bookingWeekColors, setBookingWeekColors] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);

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

  const actorRole =
    typeof managerUser?.role === "string"
      ? managerUser.role.trim().toUpperCase()
      : typeof user?.role === "string"
        ? user.role.trim().toUpperCase()
        : "";
  const isManagerManagingOther =
    managerUser && calendarUser && managerUser.id !== calendarUser.id;
  const canManageBookingActions = ["MANAGER", "BOTH"].includes(actorRole);
  const managerName = managerUser?.name || managerUser?.username || "Manager";
  const calendarUserName =
    calendarUser?.name || calendarUser?.username || "Medarbetare";

  // Hämta events-hook för calendarUser (eller manager)
  const { events, loading, addEvent, updateEvent, removeEvent } =
    useSchedulerEvents(calendarUser || user);
  // Hämta events-hook för managerUser ALLTID (hooks får ej vara villkorliga)
  const {
    addEvent: managerAddEvent,
    updateEvent: managerUpdateEvent,
    removeEvent: managerRemoveEvent,
  } = useSchedulerEvents(managerUser);

  // Håller koll på båda riktningar mellan korskalender-aktiviteter.
  const crossCalendarMapRef = useRef({});

  function stripLabelSuffix(title, labels = []) {
    let baseTitle = String(title || "Aktivitet").trim();

    labels.filter(Boolean).forEach((label) => {
      const suffix = ` - ${label}`;
      if (baseTitle.endsWith(suffix)) {
        baseTitle = baseTitle.slice(0, -suffix.length).trim();
      }
    });

    return baseTitle || "Aktivitet";
  }

  function toDatePart(value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function toTimePart(value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function toActivityPayload(eventItem, userId) {
    return {
      title: eventItem?.title || "Aktivitet",
      type: eventItem?.type || "meeting",
      date: toDatePart(eventItem?.start),
      startTime: toTimePart(eventItem?.start),
      endTime: toTimePart(eventItem?.end),
      description: eventItem?.description || eventItem?.subtitle || "",
      ...(userId ? { userId } : {}),
    };
  }

  function emitActivitiesUpdated(userId) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("zoplanner:activities:updated", {
        detail: { userId },
      }),
    );
  }

  function resolveSessionMeta(eventItem) {
    const directSessionId = eventItem?.sessionId;
    const directAssignmentId = eventItem?.assignmentId;

    if (directSessionId != null) {
      return {
        assignmentId: directAssignmentId ?? null,
        sessionId: directSessionId,
      };
    }

    const match = String(eventItem?.id || "").match(/^session-(.*?)-(.*)$/);
    if (!match) return null;
    return {
      assignmentId: match[1] || null,
      sessionId: match[2] || null,
    };
  }

  function resolveAssignmentMeta(eventItem) {
    const directAssignmentId = eventItem?.assignmentId;
    if (directAssignmentId != null) {
      return { assignmentId: directAssignmentId };
    }

    const match = String(eventItem?.id || "").match(/^assignment-(.*)$/);
    if (!match) return null;
    return { assignmentId: match[1] || null };
  }

  function getLinkedMeta(eventId) {
    return crossCalendarMapRef.current[String(eventId)] || null;
  }

  function toArray(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  async function resolveLinkedMeta(eventId) {
    if (!isManagerManagingOther) return null;

    const currentUserId = calendarUser?.id || user?.id;
    const linkedUserId = managerUser?.id;

    if (!currentUserId || !linkedUserId) return null;

    try {
      const allActivities = toArray(await activityService.getAll());
      const currentActivity = allActivities.find(
        (activity) => String(activity?.id) === String(eventId),
      );

      if (!currentActivity) return null;

      const currentBaseTitle = stripLabelSuffix(currentActivity?.title, [
        managerName,
        calendarUserName,
      ]);

      const linkedActivity = allActivities.find((activity) => {
        if (String(activity?.userId) !== String(linkedUserId)) return false;
        if (String(activity?.id) === String(currentActivity?.id)) return false;

        const linkedBaseTitle = stripLabelSuffix(activity?.title, [
          managerName,
          calendarUserName,
        ]);

        return (
          linkedBaseTitle === currentBaseTitle &&
          activity?.date === currentActivity?.date &&
          activity?.startTime === currentActivity?.startTime &&
          activity?.endTime === currentActivity?.endTime
        );
      });

      if (!linkedActivity?.id) return null;

      return {
        linkedId: String(linkedActivity.id),
        linkedUserId,
      };
    } catch {
      return null;
    }
  }

  const { filteredEvents } = useSchedulerFilters(events, {
    defaultPeriod: "all",
    defaultSortBy: "name-asc",
    navigationDate: focusDate,
    navigationView: view,
    useNavigationPeriod: false,
  });

  const { selectedEvent, handleOpenEventModal, handleCloseEventModal } =
    useEventDetailsModal();

  // Wrapper för att skapa aktivitet på båda användare om manager lägger till på annan
  async function handleCreateEventForBothUsers(eventData) {
    if (isManagerManagingOther) {
      const baseTitle = stripLabelSuffix(eventData?.title, [
        managerName,
        calendarUserName,
      ]);
      const calendarEventTitle = `${baseTitle} - ${managerName}`;
      const managerEventTitle = `${baseTitle} - ${calendarUserName}`;

      // Skapa parallellt på båda kalendrar och spara ID-kopplingen
      const [calEvent, managerEvent] = await Promise.all([
        addEvent({ ...eventData, title: calendarEventTitle }),
        managerAddEvent({
          ...eventData,
          title: managerEventTitle,
        }),
      ]);

      if (calEvent?.id && managerEvent?.id) {
        crossCalendarMapRef.current[String(calEvent.id)] = {
          linkedId: String(managerEvent.id),
          linkedUserId: managerUser?.id,
          selfLabel: managerName,
          linkedLabel: calendarUserName,
        };
        crossCalendarMapRef.current[String(managerEvent.id)] = {
          linkedId: String(calEvent.id),
          linkedUserId: calendarUser?.id,
          selfLabel: calendarUserName,
          linkedLabel: managerName,
        };
      }
    } else {
      addEvent(eventData);
    }
  }

  async function handleUpdateEventForBothUsers(updatedEvent) {
    const linkedMeta = getLinkedMeta(updatedEvent?.id);

    if (!linkedMeta) {
      updateEvent(updatedEvent);
      return;
    }

    const baseTitle = stripLabelSuffix(updatedEvent?.title, [
      linkedMeta.selfLabel,
      linkedMeta.linkedLabel,
    ]);
    const normalizedCurrentEvent = {
      ...updatedEvent,
      title: `${baseTitle} - ${linkedMeta.selfLabel}`,
    };
    const normalizedLinkedEvent = {
      ...updatedEvent,
      id: linkedMeta.linkedId,
      title: `${baseTitle} - ${linkedMeta.linkedLabel}`,
    };

    updateEvent(normalizedCurrentEvent);

    if (String(linkedMeta.linkedUserId) === String(managerUser?.id)) {
      managerUpdateEvent(normalizedLinkedEvent);
      return;
    }

    try {
      await activityService.update(
        Number(linkedMeta.linkedId),
        toActivityPayload(normalizedLinkedEvent, linkedMeta.linkedUserId),
      );
      emitActivitiesUpdated(linkedMeta.linkedUserId);
    } catch {
      // no-op
    }
  }

  async function handleDeleteEventForBothUsers(eventId) {
    const linkedMeta = getLinkedMeta(eventId);
    const resolvedLinkedMeta = linkedMeta || (await resolveLinkedMeta(eventId));

    await removeEvent(eventId);

    if (!resolvedLinkedMeta) {
      return;
    }

    if (String(resolvedLinkedMeta.linkedUserId) === String(managerUser?.id)) {
      await managerRemoveEvent(resolvedLinkedMeta.linkedId);
    } else {
      try {
        await activityService.remove(Number(resolvedLinkedMeta.linkedId));
        emitActivitiesUpdated(resolvedLinkedMeta.linkedUserId);
      } catch {
        // no-op
      }
    }

    delete crossCalendarMapRef.current[String(eventId)];
    delete crossCalendarMapRef.current[String(resolvedLinkedMeta.linkedId)];
  }

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
    const updatedEvent = { ...event, start: newStart, end: newEnd };
    handleUpdateEventForBothUsers(updatedEvent);
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
