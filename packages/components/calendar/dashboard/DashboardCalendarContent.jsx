import { memo } from "react";
import TimeGridView from "./TimeGridView";
import MonthView from "./MonthView";

function DashboardCalendarContent({
  view,
  weekDays,
  monthGridDays,
  focusDate,
  filteredEvents,
  loading,
  onEventClick,
  onDayClick,
}) {
  return (
    <div className="content-card">
      {view === "week" ? (
        <TimeGridView
          days={weekDays}
          events={filteredEvents}
          onEventClick={onEventClick}
        />
      ) : (
        <MonthView
          monthGridDays={monthGridDays}
          focusDate={focusDate}
          events={filteredEvents}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          showBookedPerson={false}
        />
      )}

      {loading && filteredEvents.length === 0 ? (
        <div style={{ padding: "12px", color: "var(--text-muted)" }}>
          Laddar kalender...
        </div>
      ) : null}
    </div>
  );
}

export default memo(DashboardCalendarContent);
