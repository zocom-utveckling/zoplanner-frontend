import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fetchConsultantUsers, fetchUserCities } from "../data/schedulerData";

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

function normalizeSearchValue(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLocaleLowerCase("sv");
}

function intersectsPeriod(eventItem, period) {
  if (!period || period === "all") return true;

  const now = new Date();
  const eventStart = eventItem?.start instanceof Date ? eventItem.start : null;
  const eventEnd = eventItem?.end instanceof Date ? eventItem.end : eventStart;

  if (!eventStart || Number.isNaN(eventStart.getTime())) {
    return false;
  }

  const safeEventEnd =
    eventEnd && !Number.isNaN(eventEnd.getTime()) ? eventEnd : eventStart;

  let periodStart = null;
  let periodEnd = null;

  if (period === "today") {
    periodStart = startOfDay(now);
    periodEnd = endOfDay(now);
  } else if (period === "thisWeek") {
    periodStart = startOfWeek(now, { weekStartsOn: 1 });
    periodEnd = endOfWeek(now, { weekStartsOn: 1 });
  } else if (period === "thisMonth") {
    periodStart = startOfMonth(now);
    periodEnd = endOfMonth(now);
  } else if (period === "next30Days") {
    periodStart = startOfDay(now);
    periodEnd = endOfDay(addDays(now, 30));
  }

  if (!periodStart || !periodEnd) return true;

  return eventStart <= periodEnd && safeEventEnd >= periodStart;
}

export default function useSchedulerFilters(events) {
  const [filters, setFilters] = useState({
    teacher: "",
    course: "",
    availability: "",
    location: "",
    period: "all",
    searchQuery: "",
  });
  const [consultantUsers, setConsultantUsers] = useState([]);
  const [userCities, setUserCities] = useState([]);

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
    const courses = new Set();
    const availability = new Set(["REMOTE", "ONSITE", "HYBRID"]);
    const locations = new Set();

    events.forEach((eventItem) => {
      const teacher = eventItem?.context?.consultant;
      const course = eventItem?.context?.course || eventItem?.title;
      const availabilityValue = normalizeAvailability(
        eventItem?.availability ||
          eventItem?.context?.availability ||
          eventItem?.locationType,
      );
      if (teacher) teachers.add(teacher);
      if (course) courses.add(course);
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
      courses: Array.from(courses).sort((a, b) => a.localeCompare(b, "sv")),
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
      const consultantName = eventItem?.context?.consultant || "";
      const courseName = eventItem?.context?.course || eventItem?.title || "";
      const locationValue =
        eventItem?.city ||
        eventItem?.context?.city ||
        eventItem?.context?.customerCity ||
        "";

      const teacherMatch =
        !filters.teacher || consultantName === filters.teacher;
      const courseMatch = !filters.course || courseName === filters.course;

      const availabilityValue = normalizeAvailability(
        eventItem?.availability ||
          eventItem?.context?.availability ||
          eventItem?.locationType,
      );
      const availabilityMatch =
        !filters.availability || availabilityValue === filters.availability;

      const normalizedLocationValue = normalizeCityKey(locationValue);
      const normalizedSelectedLocation = normalizeCityKey(filters.location);
      const locationMatch =
        !normalizedSelectedLocation ||
        normalizedLocationValue === normalizedSelectedLocation;

      const periodMatch = intersectsPeriod(eventItem, filters.period);

      const query = normalizeSearchValue(filters.searchQuery);
      const searchMatch =
        !query ||
        normalizeSearchValue(consultantName).includes(query) ||
        normalizeSearchValue(courseName).includes(query) ||
        normalizeSearchValue(locationValue).includes(query);

      return (
        teacherMatch &&
        courseMatch &&
        availabilityMatch &&
        locationMatch &&
        periodMatch &&
        searchMatch
      );
    });
  }, [events, filters]);

  function handleFilterChange(filterKey, value) {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }

  return {
    filters,
    filterOptions,
    filteredEvents,
    handleFilterChange,
  };
}
