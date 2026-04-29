import { memo } from "react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import sv from "date-fns/locale/sv";

function getSwedishLabel(value) {
  if (value === "REMOTE") return "Distans";
  if (value === "ONSITE") return "På plats";
  if (value === "HYBRID") return "Hybrid";
  return value;
}

function capitalizeWords(value) {
  if (!value) return "";
  return value
    .split(" ")
    .map((part) =>
      part ? part.charAt(0).toLocaleUpperCase("sv") + part.slice(1) : part,
    )
    .join(" ");
}

function getSubtitle(focusDate, view) {
  const safeDate = focusDate || new Date();

  if (view === "month") {
    return capitalizeWords(format(safeDate, "MMMM yyyy", { locale: sv }));
  }

  const weekStart = startOfWeek(safeDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(safeDate, { weekStartsOn: 1 });
  return `${format(weekStart, "d MMM", { locale: sv })} – ${format(
    weekEnd,
    "d MMM yyyy",
    { locale: sv },
  )}`;
}

function AllSchedulesTopbar({
  focusDate,
  view,
  setView,
  filters,
  filterOptions,
  onFilterChange,
  onGoToday,
  onPrev,
  onNext,
}) {
  return (
    <div className="all-schedules-topbar">
      <div className="all-schedules-topbar__summary-row">
        <div className="all-schedules-topbar__heading-nav">
          <button className="all-schedules-topbar__nav-btn" onClick={onPrev}>
            ←
          </button>
          <p className="all-schedules-topbar__subtitle">
            {getSubtitle(focusDate, view)}
          </p>
          <button className="all-schedules-topbar__nav-btn" onClick={onNext}>
            →
          </button>
        </div>

        <div className="all-schedules-topbar__actions">
          <button
            className="all-schedules-topbar__today-btn"
            onClick={onGoToday}
          >
            Idag
          </button>

          <div className="all-schedules-topbar__segment">
            <button
              className={`all-schedules-topbar__segment-btn ${view === "week" ? "all-schedules-topbar__segment-btn--active" : ""}`}
              onClick={() => setView("week")}
            >
              Veckovy
            </button>
            <button
              className={`all-schedules-topbar__segment-btn ${view === "month" ? "all-schedules-topbar__segment-btn--active" : ""}`}
              onClick={() => setView("month")}
            >
              Månadsvy
            </button>
          </div>
        </div>
      </div>

      <div className="all-schedules-topbar__filters">
        <input
          className="all-schedules-topbar__search"
          placeholder="Sök lärare, kurs, ort..."
          value={filters.searchQuery}
          onChange={(event) =>
            onFilterChange?.("searchQuery", event.target.value)
          }
        />

        <select
          className="all-schedules-topbar__filter-select"
          value={filters.teacher}
          onChange={(event) => onFilterChange?.("teacher", event.target.value)}
        >
          <option value="">Alla lärare</option>
          {filterOptions.teachers.map((teacher) => (
            <option key={teacher} value={teacher}>
              {teacher}
            </option>
          ))}
        </select>

        <select
          className="all-schedules-topbar__filter-select"
          value={filters.course}
          onChange={(event) => onFilterChange?.("course", event.target.value)}
        >
          <option value="">Alla kurser</option>
          {filterOptions.courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>

        <select
          className="all-schedules-topbar__filter-select"
          value={filters.location}
          onChange={(event) => onFilterChange?.("location", event.target.value)}
        >
          <option value="">Alla städer</option>
          {filterOptions.locations.map((locationValue) => (
            <option key={locationValue} value={locationValue}>
              {getSwedishLabel(locationValue)}
            </option>
          ))}
        </select>

        <select
          className="all-schedules-topbar__filter-select"
          value={filters.sortBy}
          onChange={(event) => onFilterChange?.("sortBy", event.target.value)}
        >
          <option value="name-asc">Sortera efter: Namn A-Ö</option>
          <option value="name-desc">Sortera efter: Namn Ö-A</option>
        </select>
      </div>
    </div>
  );
}

export default memo(AllSchedulesTopbar);
