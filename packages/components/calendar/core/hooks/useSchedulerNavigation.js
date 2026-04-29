import { useMemo, useState } from "react";
import {
  addDays,
  addWeeks,
  addMonths,
  format,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import sv from "date-fns/locale/sv";

export default function useSchedulerNavigation({
  initialView = "week",
  lockedView = null,
} = {}) {
  const [view, setViewState] = useState(initialView);
  const [focusDate, setFocusDate] = useState(new Date());
  const currentView = lockedView ?? view;
  const setView = lockedView ? () => {} : setViewState;

  const weekStart = useMemo(
    () => startOfWeek(focusDate, { weekStartsOn: 1 }),
    [focusDate],
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const title = useMemo(() => {
    if (currentView === "day") {
      return format(focusDate, "EEEE d MMMM yyyy", { locale: sv });
    }

    if (currentView === "week") {
      return `Vecka ${format(focusDate, "I, yyyy", { locale: sv })}`;
    }

    return format(focusDate, "MMMM yyyy", { locale: sv });
  }, [currentView, focusDate]);

  const monthStart = startOfMonth(focusDate);

  const monthGridDays = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [monthStart]);

  function goToday() {
    setFocusDate(new Date());
  }

  function goPrev() {
    if (currentView === "day") {
      setFocusDate((currentDate) => addDays(currentDate, -1));
      return;
    }

    if (currentView === "week") {
      setFocusDate((currentDate) => addWeeks(currentDate, -1));
      return;
    }

    setFocusDate((currentDate) =>
      startOfMonth(addMonths(startOfMonth(currentDate), -1)),
    );
  }

  function goNext() {
    if (currentView === "day") {
      setFocusDate((currentDate) => addDays(currentDate, 1));
      return;
    }

    if (currentView === "week") {
      setFocusDate((currentDate) => addWeeks(currentDate, 1));
      return;
    }

    setFocusDate((currentDate) =>
      startOfMonth(addMonths(startOfMonth(currentDate), 1)),
    );
  }

  return {
    view: currentView,
    setView,
    focusDate,
    setFocusDate,
    weekDays,
    monthGridDays,
    title,
    goToday,
    goPrev,
    goNext,
  };
}
