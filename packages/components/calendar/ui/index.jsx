import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addWeeks,
  addMonths,
  format,
  startOfWeek,
  startOfMonth,
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

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export default function Scheduler({ user }) {
  const [view, setView] = useState("week");
  const [focusDate, setFocusDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityFormData, setActivityFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "meeting",
  });

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

  function handleOpenActivityModal(date) {
    const selectedDate = format(date, "yyyy-MM-dd");
    setFocusDate(date);
    setActivityFormData({
      title: "",
      description: "",
      date: selectedDate,
      startTime: "",
      endTime: "",
      type: "meeting",
    });
    setIsActivityModalOpen(true);
  }

  function handleCloseActivityModal() {
    setIsActivityModalOpen(false);
  }

  function handleActivityChange(event) {
    const { name, value } = event.target;
    setActivityFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleActivitySubmit(event) {
    event.preventDefault();

    const start = toLocalDateTime(
      `${activityFormData.date} ${activityFormData.startTime}:00`,
    );
    const end = toLocalDateTime(
      `${activityFormData.date} ${activityFormData.endTime}:00`,
    );

    if (start && end) {
      setEvents((prev) => [
        ...prev,
        {
          id: `manual-${Date.now()}`,
          title: activityFormData.title,
          subtitle: activityFormData.description,
          start,
          end,
          type: activityFormData.type || "manual",
        },
      ]);
    }

    setActivityFormData({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "meeting",
    });
    setIsActivityModalOpen(false);
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
            `http://localhost:5027/api/Consultant`,
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

        const coursesRes = await fetch(`http://localhost:5027/api/Course`);
        const courses = coursesRes.ok ? await coursesRes.json() : [];
        const courseMap = new Map(
          (Array.isArray(courses) ? courses : [])
            .map((course) => [
              course?.id,
              firstNonEmptyString(
                course?.name,
                course?.Name,
                course?.courseName,
                course?.title,
              ),
            ])
            .filter(([id, name]) => Boolean(id) && Boolean(name)),
        );

        const nextEvents = [];

        assignments.forEach((assignment) => {
          const assignmentCourseId =
            assignment?.course?.id ||
            assignment?.courseId ||
            assignment?.idCourse;
          const courseName =
            (assignmentCourseId ? courseMap.get(assignmentCourseId) : null) ||
            "Uppdrag";
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

              nextEvents.push({
                id: `session-${assignment.id}-${session.id}`,
                title: courseName,
                subtitle: firstNonEmptyString(
                  session?.comment,
                  session?.Comment,
                  session?.sessionComment,
                  session?.description,
                ),
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
            title: courseName,
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
            onDayClick={handleOpenActivityModal}
          />
        )}
        {loading && events.length === 0 ? (
          <div style={{ padding: "12px", color: "var(--text-muted)" }}>
            Laddar kalender...
          </div>
        ) : null}
      </div>

      {isActivityModalOpen && (
        <div
          className="scheduler-modal-overlay"
          onClick={handleCloseActivityModal}
        >
          <div
            className="scheduler-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="scheduler-modal-header">
              <h2>Lägg till aktivitet</h2>
              <button
                className="scheduler-close-btn"
                onClick={handleCloseActivityModal}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleActivitySubmit}
              className="scheduler-activity-form"
            >
              <div className="scheduler-form-group">
                <label htmlFor="title">Titel *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={activityFormData.title}
                  onChange={handleActivityChange}
                  required
                  placeholder="T.ex. Möte med kursledare"
                />
              </div>

              <div className="scheduler-form-group">
                <label htmlFor="type">Typ av aktivitet *</label>
                <select
                  id="type"
                  name="type"
                  value={activityFormData.type}
                  onChange={handleActivityChange}
                  required
                >
                  <option value="meeting">Möte</option>
                  <option value="lecture">Lektion</option>
                  <option value="review">Granskning</option>
                  <option value="preparation">Förberedelse</option>
                  <option value="other">Annat</option>
                </select>
              </div>

              <div className="scheduler-form-group">
                <label htmlFor="date">Datum *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={activityFormData.date}
                  onChange={handleActivityChange}
                  required
                />
              </div>

              <div className="scheduler-form-row">
                <div className="scheduler-form-group">
                  <label htmlFor="startTime">Starttid *</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={activityFormData.startTime}
                    onChange={handleActivityChange}
                    required
                  />
                </div>

                <div className="scheduler-form-group">
                  <label htmlFor="endTime">Sluttid *</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={activityFormData.endTime}
                    onChange={handleActivityChange}
                    required
                  />
                </div>
              </div>

              <div className="scheduler-form-group">
                <label htmlFor="description">Beskrivning</label>
                <textarea
                  id="description"
                  name="description"
                  value={activityFormData.description}
                  onChange={handleActivityChange}
                  rows="4"
                  placeholder="Lägg till eventuella anteckningar..."
                />
              </div>

              <div className="scheduler-modal-actions">
                <button
                  type="button"
                  className="scheduler-btn-cancel"
                  onClick={handleCloseActivityModal}
                >
                  Avbryt
                </button>
                <button type="submit" className="scheduler-btn-submit">
                  Lägg till
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
