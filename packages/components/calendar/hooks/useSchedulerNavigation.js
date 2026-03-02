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

export default function useSchedulerNavigation() {
  const [view, setView] = useState("week");
  const [focusDate, setFocusDate] = useState(new Date());

  const weekStart = useMemo(
    () => startOfWeek(focusDate, { weekStartsOn: 1 }),
    [focusDate],
  );

  const weekDays = useMemo(
    () => Array.from({ length: 5 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const title = useMemo(() => {
    if (view === "day") {
      return format(focusDate, "EEEE d MMMM yyyy", { locale: sv });
    }

    if (view === "week") {
      return `Vecka ${format(focusDate, "I, yyyy", { locale: sv })}`;
    }

    return format(focusDate, "MMMM yyyy", { locale: sv });
  }, [view, focusDate]);

  const monthStart = startOfMonth(focusDate);

  const monthGridDays = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [monthStart]);

  function goToday() {
    setFocusDate(new Date());
  }

  function goPrev() {
    if (view === "day") {
      setFocusDate((currentDate) => addDays(currentDate, -1));
      return;
    }

    if (view === "week") {
      setFocusDate((currentDate) => addWeeks(currentDate, -1));
      return;
    }

    setFocusDate((currentDate) => addMonths(currentDate, -1));
  }

  function goNext() {
    if (view === "day") {
      setFocusDate((currentDate) => addDays(currentDate, 1));
      return;
    }

    if (view === "week") {
      setFocusDate((currentDate) => addWeeks(currentDate, 1));
      return;
    }

    setFocusDate((currentDate) => addMonths(currentDate, 1));
  }

  return {
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
  };
}
