import Topbar from "./Topbar";
import TimeGridView from "./TimeGridView";
import MonthView from "./MonthView";
import ActivityModal from "./modals/ActivityModal";
import EventDetailsModal from "./modals/EventDetailsModal";
import useSchedulerNavigation from "../hooks/useSchedulerNavigation";
import useActivityForm from "../hooks/useActivityForm";
import useEventDetailsModal from "../hooks/useEventDetailsModal";
import useSchedulerEvents from "../hooks/useSchedulerEvents";
import { fetchConsultantUsers, fetchUserCities } from "../data/schedulerData";
import { useEffect, useMemo, useState } from "react";
import "./index.css";

function normalizeAvailability(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === "REMOTE") return "REMOTE";
  if (normalized === "ONSITE") return "ONSITE";
  if (normalized === "HYBRID") return "HYBRID";
  return null;
}

function normalizeCityKey(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLocaleLowerCase("sv");
  return normalized || null;
}

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
  const [filters, setFilters] = useState({
    teacher: "",
    availability: "",
    location: "",
  });
  const [consultantUsers, setConsultantUsers] = useState([]);
  const [userCities, setUserCities] = useState([]);
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

    async function loadFilterData() {
      const [names, cities] = await Promise.all([
        fetchConsultantUsers(),
        fetchUserCities(),
      ]);

      if (!isCancelled) {
        setConsultantUsers(Array.isArray(names) ? names : []);
        setUserCities(Array.isArray(cities) ? cities : []);
      }
    }

    loadFilterData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filterOptions = useMemo(() => {
    const teachers = new Set();
    const availability = new Set(["REMOTE", "ONSITE", "HYBRID"]);
    const locations = new Set();

    events.forEach((eventItem) => {
      const teacher = eventItem?.context?.consultant;
      const availabilityValue = normalizeAvailability(
        eventItem?.availability ||
          eventItem?.context?.availability ||
          eventItem?.locationType,
      );
      if (teacher) teachers.add(teacher);
      if (availabilityValue) availability.add(availabilityValue);
    });

    consultantUsers.forEach((teacher) => {
      if (teacher) teachers.add(teacher);
    });

    userCities.forEach((city) => {
      if (city) locations.add(city);
    });

    return {
      teachers: Array.from(teachers).sort((a, b) => a.localeCompare(b, "sv")),
      availability: Array.from(availability).sort((a, b) =>
        a.localeCompare(b, "sv"),
      ),
      locations: Array.from(locations).sort((a, b) =>
        a.localeCompare(b, "sv", { sensitivity: "base" }),
      ),
    };
  }, [events, consultantUsers, userCities]);

  const filteredEvents = useMemo(() => {
    return events.filter((eventItem) => {
      const teacherMatch =
        !filters.teacher || eventItem?.context?.consultant === filters.teacher;

      const availabilityValue = normalizeAvailability(
        eventItem?.availability ||
          eventItem?.context?.availability ||
          eventItem?.locationType,
      );
      const availabilityMatch =
        !filters.availability || availabilityValue === filters.availability;

      const locationValue =
        eventItem?.city ||
        eventItem?.context?.city ||
        eventItem?.context?.customerCity;

      const normalizedLocationValue = normalizeCityKey(locationValue);
      const normalizedSelectedLocation = normalizeCityKey(filters.location);
      const locationMatch =
        !normalizedSelectedLocation ||
        normalizedLocationValue === normalizedSelectedLocation;

      return teacherMatch && availabilityMatch && locationMatch;
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
