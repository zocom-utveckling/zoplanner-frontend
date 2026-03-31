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
  allConsultants = [],
  filters,
  loading,
  monthOnly,
  allSchedules,
  onEventClick,
  onDayClick,
  onFocusDateChange,
  onViewChange,
}) {
  return (
    <div className="content-card">
      {allSchedules && (
        <AllSchedulesView
          view={view}
          focusDate={focusDate}
          weekDays={weekDays}
          events={filteredEvents}
          allConsultants={allConsultants}
          sortBy={filters?.sortBy}
          onEventClick={onEventClick}
          onDaySelect={(day) => {
            onFocusDateChange?.(day);
            onViewChange?.(view);
          }}
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
