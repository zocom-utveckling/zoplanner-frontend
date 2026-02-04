import React, { useEffect, useMemo, useState } from "react";
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

function toDateWithTime(dateValue, hours, minutes) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) {
    const baseDate = new Date(dateValue);
    if (Number.isNaN(baseDate.getTime())) return null;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  if (
    typeof dateValue === "object" &&
    dateValue !== null &&
    "year" in dateValue &&
    "month" in dateValue &&
    "day" in dateValue
  ) {
    const baseDate = new Date(
      dateValue.year,
      Math.max(0, dateValue.month - 1),
      dateValue.day,
    );
    if (Number.isNaN(baseDate.getTime())) return null;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  const asString = String(dateValue);
  if (/^\d{4}-\d{2}-\d{2}$/.test(asString)) {
    const [year, month, day] = asString.split("-").map(Number);
    const baseDate = new Date(year, Math.max(0, month - 1), day);
    if (Number.isNaN(baseDate.getTime())) return null;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }
  const base = asString.includes("T")
    ? new Date(asString)
    : new Date(`${asString}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  base.setHours(hours, minutes, 0, 0);
  return base;
}

function toLocalDateTime(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : new Date(dateValue);
  }

  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();
    const match = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
    );

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const hour = Number(match[4]);
      const minute = Number(match[5]);
      const second = match[6] ? Number(match[6]) : 0;
      const localDate = new Date(year, month - 1, day, hour, minute, second, 0);
      return Number.isNaN(localDate.getTime()) ? null : localDate;
    }
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function Scheduler({ user }) {
  const [view, setView] = useState("week");
  const [focusDate, setFocusDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const weekStart = useMemo(
    () => startOfWeek(focusDate, { weekStartsOn: 1 }),
    [focusDate],
  );
  const weekDays = useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
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

  useEffect(() => {
    let isCancelled = false;

    async function loadEvents() {
      if (!user?.id) {
        setEvents([]);
        return;
      }

      setLoading(true);

      try {
        let consultantId = user?.consultantId || user?.consultant?.id;

        if (!consultantId) {
          const consultantsRes = await fetch(
            "http://localhost:5027/api/Consultant",
          );
          const consultants = consultantsRes.ok
            ? await consultantsRes.json()
            : [];
          const match = consultants.find(
            (consultant) => consultant?.userId === user?.id,
          );
          consultantId = match?.id;
        }

        if (!consultantId) {
          if (!isCancelled) setEvents([]);
          return;
        }

        const assignmentsRes = await fetch(
          `http://localhost:5027/api/Assignment/consultant/${consultantId}`,
        );

        const assignments = assignmentsRes.ok
          ? await assignmentsRes.json()
          : [];

        const classIds = Array.from(
          new Set(
            assignments
              .map(
                (assignment) =>
                  assignment?.course?.classId ||
                  assignment?.classId ||
                  assignment?.courseClassId,
              )
              .filter(Boolean),
          ),
        );

        const classEntries = await Promise.all(
          classIds.map(async (classId) => {
            try {
              const res = await fetch(
                `http://localhost:5027/api/Class/${classId}`,
              );
              if (!res.ok) return null;
              const data = await res.json();
              return [classId, data?.name || data?.className || null];
            } catch {
              return null;
            }
          }),
        );

        const classMap = new Map(classEntries.filter(Boolean));

        const nextEvents = [];

        assignments.forEach((assignment) => {
          const courseName =
            assignment?.course?.name || assignment?.courseName || "Uppdrag";
          const classId =
            assignment?.course?.classId ||
            assignment?.classId ||
            assignment?.courseClassId;
          const className = classId ? classMap.get(classId) : null;
          const classLine = className ? `\n${className}` : "";

          const sessions = assignment?.sessions || [];

          if (Array.isArray(sessions) && sessions.length > 0) {
            sessions.forEach((session) => {
              const start = toLocalDateTime(
                session?.timeStart || session?.start || session?.time_start,
              );
              const end = toLocalDateTime(
                session?.timeEnd || session?.end || session?.time_end,
              );

              if (!start || !end) return;

              const locationLine = session?.location
                ? `\n${session.location}`
                : "\nSession";

              nextEvents.push({
                id: `session-${assignment.id}-${session.id}`,
                title: `${courseName}${classLine}${locationLine}`,
                start,
                end,
                type: "session",
              });
            });
          }

          const start =
            toDateWithTime(assignment?.course?.dateStart, 8, 0) ||
            toDateWithTime(assignment?.dateStart, 8, 0) ||
            toDateWithTime(assignment?.startDate, 8, 0);
          const end =
            toDateWithTime(assignment?.course?.dateEnd, 17, 0) ||
            toDateWithTime(assignment?.dateEnd, 17, 0) ||
            toDateWithTime(assignment?.dateStart, 17, 0);

          if (!start || !end) return;

          nextEvents.push({
            id: `assignment-${assignment.id}`,
            title: `${courseName}${classLine}\nUppdrag`,
            start,
            end,
            type: "assignment",
          });
        });

        if (!isCancelled) setEvents(nextEvents);
      } catch {
        if (!isCancelled) setEvents([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

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
        {loading && events.length === 0 ? (
          <div style={{ padding: "12px", color: "#6b7280" }}>
            Laddar kalender...
          </div>
        ) : null}
      </div>
    </main>
  );
}
