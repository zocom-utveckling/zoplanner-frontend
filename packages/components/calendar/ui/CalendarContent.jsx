import { memo } from "react";
import TimeGridView from "./TimeGridView";
import MonthView from "./MonthView";
import AllSchedulesView from "./AllSchedulesView";

function CalendarContent({
  view,
  focusDate,
  weekDays,
  monthGridDays,
  filteredEvents,
  filters,
  loading,
  monthOnly,
  allSchedules,
  onEventClick,
  onDayClick,
  onFocusDateChange,
}) {
  return (
    <div className="content-card">
      {allSchedules && (
        <AllSchedulesView
          view={view}
          focusDate={focusDate}
          weekDays={weekDays}
          events={filteredEvents}
          sortBy={filters?.sortBy}
          onEventClick={onEventClick}
          onDaySelect={onFocusDateChange}
        />
      )}

      {view === "day" && !allSchedules && (
        <TimeGridView
          days={[focusDate]}
          events={filteredEvents}
          onEventClick={onEventClick}
        />
      )}
      {view === "week" && !allSchedules && (
        <TimeGridView
          days={weekDays}
          events={filteredEvents}
          onEventClick={onEventClick}
        />
      )}
      {view === "month" && !allSchedules && (
        <MonthView
          monthGridDays={monthGridDays}
          focusDate={focusDate}
          events={filteredEvents}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          showBookedPerson={monthOnly}
          deduplicateConsultantsPerDay={allSchedules}
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

export default memo(CalendarContent);
