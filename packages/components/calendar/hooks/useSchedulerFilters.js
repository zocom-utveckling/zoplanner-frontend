import { useCallback, useEffect, useMemo, useState } from "react";
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

function normalizeCityKey(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLocaleLowerCase("sv");
  return normalized || null;
}

function normalizeSearchValue(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLocaleLowerCase("sv");
}

function periodFromView(view) {
  if (view === "day") return "today";
  if (view === "week") return "thisWeek";
  return "thisMonth";
}

function intersectsPeriod(eventItem, period, referenceDate = new Date()) {
  if (!period || period === "all") return true;

  const baseDate =
    referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())
      ? referenceDate
      : new Date();
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
    periodStart = startOfDay(baseDate);
    periodEnd = endOfDay(baseDate);
  } else if (period === "thisWeek") {
    periodStart = startOfWeek(baseDate, { weekStartsOn: 1 });
    periodEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
  } else if (period === "thisMonth") {
    periodStart = startOfMonth(baseDate);
    periodEnd = endOfMonth(baseDate);
  } else if (period === "next30Days") {
    periodStart = startOfDay(baseDate);
    periodEnd = endOfDay(addDays(baseDate, 30));
  }

  if (!periodStart || !periodEnd) return true;

  return eventStart <= periodEnd && safeEventEnd >= periodStart;
}

export default function useSchedulerFilters(events, options = {}) {
  const navigationDate = options?.navigationDate;
  const navigationView = options?.navigationView || "month";
  const useNavigationPeriod = Boolean(options?.useNavigationPeriod);

  const [filters, setFilters] = useState(() => ({
    teacher: "",
    course: "",
    location: "",
    period: options?.defaultPeriod || "all",
    searchQuery: "",
    sortBy: options?.defaultSortBy || "name-asc",
  }));
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
    const locations = new Set();

    events.forEach((eventItem) => {
      const teacher = eventItem?.context?.consultant;
      const course = eventItem?.context?.course || eventItem?.title;
      if (teacher) teachers.add(teacher);
      if (course) courses.add(course);
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
      locations: Array.from(locations).sort((a, b) =>
        a.localeCompare(b, "sv", { sensitivity: "base" }),
      ),
    };
  }, [events, consultantUsers, userCities]);

  const filteredEvents = useMemo(() => {
    const effectivePeriod = useNavigationPeriod
      ? periodFromView(navigationView)
      : filters.period;

    const visibleEvents = events.filter((eventItem) => {
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

      const normalizedLocationValue = normalizeCityKey(locationValue);
      const normalizedSelectedLocation = normalizeCityKey(filters.location);
      const locationMatch =
        !normalizedSelectedLocation ||
        normalizedLocationValue === normalizedSelectedLocation;

      const periodMatch = intersectsPeriod(
        eventItem,
        effectivePeriod,
        navigationDate,
      );

      const query = normalizeSearchValue(filters.searchQuery);
      const searchMatch =
        !query ||
        normalizeSearchValue(consultantName).includes(query) ||
        normalizeSearchValue(courseName).includes(query) ||
        normalizeSearchValue(locationValue).includes(query);

      return (
        teacherMatch &&
        courseMatch &&
        locationMatch &&
        periodMatch &&
        searchMatch
      );
    });

    const nextEvents = [...visibleEvents];
    const direction = filters.sortBy === "name-desc" ? -1 : 1;

    nextEvents.sort((eventA, eventB) => {
      const eventATeacher = eventA?.context?.consultant || "";
      const eventBTeacher = eventB?.context?.consultant || "";
      const byTeacher =
        eventATeacher.localeCompare(eventBTeacher, "sv", {
          sensitivity: "base",
        }) * direction;

      if (byTeacher !== 0) return byTeacher;

      const byStart = eventA.start - eventB.start;
      if (byStart !== 0) return byStart;

      return (eventA.title || "").localeCompare(eventB.title || "", "sv", {
        sensitivity: "base",
      });
    });

    return nextEvents;
  }, [events, filters, navigationDate, navigationView, useNavigationPeriod]);

  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  return {
    filters,
    filterOptions,
    filteredEvents,
    handleFilterChange,
  };
}
