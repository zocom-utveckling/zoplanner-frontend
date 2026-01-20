import React, { useMemo, useState } from "react";
import {
  addDays,
  addWeeks,
  addMonths,
  format,
  startOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import sv from "date-fns/locale/sv";
import Topbar from "./Topbar";
import TimeGridView from "./TimeGridView";
import MonthView from "./MonthView";
import "./index.css";

// Exempeldata (dummy-data byt ut senare)
const initialEvents = [
  {
    id: "e1",
    title: "HTML & CSS\nGrundläggande\nSal F1",
    start: new Date(2026, 0, 20, 9, 0),
    end: new Date(2026, 0, 20, 10, 30),
  },
  {
    id: "e2",
    title: "Handlednings tid\nArbetsrum",
    start: new Date(2026, 0, 21, 11, 0),
    end: new Date(2026, 0, 21, 12, 0),
  },
  {
    id: "e3",
    title: "JavaScript\nGrundkurs\nSal F1",
    start: new Date(2026, 0, 22, 9, 30),
    end: new Date(2026, 0, 22, 11, 0),
  },
];

export default function Scheduler() {
  const [view, setView] = useState("week");
  const [focusDate, setFocusDate] = useState(new Date());
  const [events] = useState(initialEvents);

  const weekStart = useMemo(
    () => startOfWeek(focusDate, { weekStartsOn: 1 }),
    [focusDate]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const title = useMemo(() => {
    if (view === "day")
      return format(focusDate, "EEEE d MMMM yyyy", { locale: sv });
    if (view === "week")
      return `Vecka ${format(focusDate, "I, yyyy", { locale: sv })}`;
    return format(focusDate, "MMMM yyyy", { locale: sv });
  }, [view, focusDate]);

  const monthStart = startOfMonth(focusDate);
  const monthEnd = endOfMonth(focusDate);

  const monthGridDays = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [monthStart]);

  function goToday() {
    setFocusDate(new Date());
  }

  function goPrev() {
    if (view === "day") {
      setFocusDate((d) => addDays(d, -1));
    } else if (view === "week") {
      setFocusDate((d) => addWeeks(d, -1));
    } else {
      setFocusDate((d) => addMonths(d, -1));
    }
  }

  function goNext() {
    if (view === "day") {
      setFocusDate((d) => addDays(d, 1));
    } else if (view === "week") {
      setFocusDate((d) => addWeeks(d, 1));
    } else {
      setFocusDate((d) => addMonths(d, 1));
    }
  }

  function jump(deltaDays) {
    setFocusDate((d) => addDays(d, deltaDays));
  }

  return (
    <main className="main">
      <Topbar
        title={title}
        view={view}
        setView={setView}
        onGoToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
      />

      <div className="content-card">
        {view === "day" && <TimeGridView days={[focusDate]} events={events} />}
        {view === "week" && <TimeGridView days={weekDays} events={events} />}
        {view === "month" && (
          <MonthView
            monthGridDays={monthGridDays}
            focusDate={focusDate}
            events={events}
            onDayClick={setFocusDate}
          />
        )}
      </div>
    </main>
  );
}
