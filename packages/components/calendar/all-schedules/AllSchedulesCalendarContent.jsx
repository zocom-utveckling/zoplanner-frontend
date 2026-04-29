import { memo } from "react";
import AllSchedulesView from "./AllSchedulesView";

function AllSchedulesCalendarContent({
  view,
  focusDate,
  weekDays,
  filteredEvents,
  allConsultants,
  filters,
  loading,
  onEventClick,
  onFocusDateChange,
}) {
  return (
    <div className="all-schedules-scheduler__content-card">
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
        }}
      />

      {loading && filteredEvents.length === 0 ? (
        <div style={{ padding: "12px", color: "var(--text-muted)" }}>
          Laddar kalender...
        </div>
      ) : null}
    </div>
  );
}

export default memo(AllSchedulesCalendarContent);
