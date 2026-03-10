import Topbar from "./Topbar";
import TimeGridView from "./TimeGridView";
import MonthView from "./MonthView";
import ActivityModal from "./modals/ActivityModal";
import EventDetailsModal from "./modals/EventDetailsModal";
import useSchedulerNavigation from "../hooks/useSchedulerNavigation";
import useActivityForm from "../hooks/useActivityForm";
import useEventDetailsModal from "../hooks/useEventDetailsModal";
import useSchedulerEvents from "../hooks/useSchedulerEvents";
import { fetchConsultantUsers } from "../data/schedulerData";
import { useEffect, useMemo, useState } from "react";
import "./index.css";

export default function Scheduler({ user, monthOnly = false }) {
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
  const { events, loading, addEvent, removeEvent } = useSchedulerEvents(user);
  const [filters, setFilters] = useState({
    teacher: "",
    availability: "",
    city: "",
  });
  const [consultantUsers, setConsultantUsers] = useState([]);
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

  useEffect(() => {
    let isCancelled = false;

    async function loadConsultantUsers() {
      const names = await fetchConsultantUsers();
      if (!isCancelled) {
        setConsultantUsers(Array.isArray(names) ? names : []);
      }
    }

    loadConsultantUsers();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filterOptions = useMemo(() => {
    const teachers = new Set();
    const availability = new Set();
    const cities = new Set();

    events.forEach((eventItem) => {
      const teacher = eventItem?.context?.consultant;
      const availabilityValue =
        eventItem?.availability ||
        eventItem?.context?.availability ||
        eventItem?.locationType;
      const city =
        eventItem?.city ||
        eventItem?.context?.city ||
        eventItem?.context?.customerCity;

      if (teacher) teachers.add(teacher);
      if (availabilityValue) availability.add(availabilityValue);
      if (city) cities.add(city);
    });

    consultantUsers.forEach((teacher) => {
      if (teacher) teachers.add(teacher);
    });

    return {
      teachers: Array.from(teachers).sort((a, b) => a.localeCompare(b, "sv")),
      availability: Array.from(availability).sort((a, b) =>
        a.localeCompare(b, "sv"),
      ),
      cities: Array.from(cities).sort((a, b) => a.localeCompare(b, "sv")),
    };
  }, [events, consultantUsers]);

  const filteredEvents = useMemo(() => {
    return events.filter((eventItem) => {
      const teacherMatch =
        !filters.teacher || eventItem?.context?.consultant === filters.teacher;

      const availabilityValue =
        eventItem?.availability ||
        eventItem?.context?.availability ||
        eventItem?.locationType;
      const availabilityMatch =
        !filters.availability || availabilityValue === filters.availability;

      const city =
        eventItem?.city ||
        eventItem?.context?.city ||
        eventItem?.context?.customerCity;
      const cityMatch = !filters.city || city === filters.city;

      return teacherMatch && availabilityMatch && cityMatch;
    });
  }, [events, filters]);

  function handleFilterChange(filterKey, value) {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }

  return (
    <main className="main">
      <Topbar
        title={title}
        view={view}
        setView={setView}
        availableViews={monthOnly ? ["month"] : ["day", "week", "month"]}
        showFilters={monthOnly}
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
