import { useState } from "react";
// Hjälpfunktion för att konvertera assignment till event-objekt för EventDetailsModal
function assignmentToEvent(assignment) {
  const start = assignment?.dateStart
    ? new Date(assignment.dateStart)
    : assignment?.course?.dateStart
      ? new Date(assignment.course.dateStart)
      : null;
  const end = assignment?.dateEnd
    ? new Date(assignment.dateEnd)
    : assignment?.course?.dateEnd
      ? new Date(assignment.course.dateEnd)
      : null;
  return {
    id: assignment?.id,
    title: assignment?.course?.name || assignment?.title || "Uppdrag",
    start,
    end,
    description: assignment?.description || assignment?.comment || null,
    locationType: assignment?.locationType || assignment?.location || null,
    context: {
      className:
        assignment?.className ||
        assignment?.class?.name ||
        assignment?.schoolClass?.name ||
        null,
      customer: assignment?.customer?.name || assignment?.customerName || null,
      room: assignment?.room || null,
    },
  };
}
import { useCurrentActor } from "@zoplanner/app-hooks";
import { useProfileData } from "../../../pages/profile-page/hooks/useProfileData";
import {
  formatDateRange,
  formatActivityTime,
} from "../../../pages/profile-page/utils/profile.utils";
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
  // Hämta consultantId för inloggad användare
  const { consultantId } = useCurrentActor(user);
  const { assignments, activities, isLoadingSidebarData } = useProfileData(
    user,
    consultantId,
  );
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

  // Hämta events-hook för calendarUser (eller manager)
  const { events, loading, addEvent, updateEvent, removeEvent } =
    useSchedulerEvents(calendarUser || user);
  // Hämta events-hook för managerUser ALLTID (hooks får ej vara villkorliga)
  const managerEventsApi = useSchedulerEvents(managerUser);

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
  function handleCreateEventForBothUsers(eventData) {
    addEvent(eventData);
    if (managerUser && calendarUser && managerUser.id !== calendarUser.id) {
      managerEventsApi.addEvent(eventData);
    }
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
    onDeleteEvent: removeEvent,
    onUpdateEvent: updateEvent,
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAssignmentEvent, setSelectedAssignmentEvent] = useState(null);
  const [selectedActivityEvent, setSelectedActivityEvent] = useState(null);

  function activityToEvent(activity) {
    const date = activity?.date ? new Date(activity.date) : null;
    return {
      id: activity?.id,
      title: activity?.title || "Aktivitet",
      start: date,
      end: date,
      description: activity?.description || null,
      context: {},
    };
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

      {/* Mina uppdrag under kalendern */}
      {/* Egna cards för uppdrag och aktiviteter */}
      <div className="content-card" style={{ marginTop: 24 }}>
        <section className="profile-page-panel" style={{ margin: 0 }}>
          <h3 className="profile-page-panel-title">Mina uppdrag</h3>
          {isLoadingSidebarData ? (
            <p className="profile-page-empty">Laddar uppdrag...</p>
          ) : assignments.length ? (
            <div className="profile-page-list">
              {assignments.slice(0, 5).map((assignment) => (
                <article
                  key={assignment?.id || assignment?.course?.id}
                  className="profile-page-list-item"
                >
                  <div>
                    <h4 className="profile-page-list-title">
                      {assignment?.course?.name || "Uppdrag"}
                    </h4>
                    <p className="profile-page-list-subtitle">
                      {formatDateRange(
                        assignment?.dateStart || assignment?.course?.dateStart,
                        assignment?.dateEnd || assignment?.course?.dateEnd,
                      )}
                    </p>
                  </div>
                  <button
                    className="profile-page-list-btn"
                    type="button"
                    onClick={() =>
                      setSelectedAssignmentEvent(assignmentToEvent(assignment))
                    }
                  >
                    Mer info
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="profile-page-empty">Inga uppdrag hittades.</p>
          )}
        </section>
      </div>

      <div className="content-card" style={{ marginTop: 24 }}>
        <section className="profile-page-panel" style={{ margin: 0 }}>
          <h3 className="profile-page-panel-title">Aktiviteter</h3>
          {isLoadingSidebarData ? (
            <p className="profile-page-empty">Laddar aktiviteter...</p>
          ) : activities.length ? (
            <div className="profile-page-list">
              {activities.slice(0, 5).map((activity) => (
                <article
                  key={activity?.id || `${activity?.title}-${activity?.date}`}
                  className="profile-page-list-item"
                >
                  <div>
                    <h4 className="profile-page-list-title">
                      {activity?.title || "Aktivitet"}
                    </h4>
                    <p className="profile-page-list-subtitle">
                      {formatActivityTime(activity)}
                    </p>
                    {activity?.description && (
                      <p className="profile-page-list-description">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <button
                    className="profile-page-list-btn"
                    type="button"
                    onClick={() =>
                      setSelectedActivityEvent(activityToEvent(activity))
                    }
                  >
                    Mer info
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="profile-page-empty">Inga aktiviteter hittades.</p>
          )}
        </section>
      </div>

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
      {/* Mer info om uppdrag */}
      <EventDetailsModal
        event={selectedAssignmentEvent}
        onClose={() => setSelectedAssignmentEvent(null)}
        userRole={user?.role}
      />
      {/* Mer info om aktivitet */}
      <EventDetailsModal
        event={selectedActivityEvent}
        onClose={() => setSelectedActivityEvent(null)}
        userRole={user?.role}
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
