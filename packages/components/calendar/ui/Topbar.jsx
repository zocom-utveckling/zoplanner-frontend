import { memo } from "react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import sv from "date-fns/locale/sv";

function Topbar({
  title,
  focusDate,
  view,
  setView,
  allSchedules = false,
  availableViews = ["day", "week", "month"],
  showFilters = false,
  filterOptions = {
    teachers: [],
    courses: [],
    locations: [],
  },
  filters = {
    teacher: "",
    course: "",
    location: "",
    period: "all",
    searchQuery: "",
  },
  onFilterChange,
  onGoToday,
  onPrev,
  onNext,
}) {
  function capitalizeWords(value) {
    if (!value) return "";
    return value
      .split(" ")
      .map((part) =>
        part ? part.charAt(0).toLocaleUpperCase("sv") + part.slice(1) : part,
      )
      .join(" ");
  }

  function getSwedishLabel(value) {
    if (value === "REMOTE") return "Distans";
    if (value === "ONSITE") return "På plats";
    if (value === "HYBRID") return "Hybrid";
    return value;
  }

  function getAllSchedulesSubtitle() {
    const safeDate = focusDate || new Date();

    if (view === "month") {
      return capitalizeWords(format(safeDate, "MMMM yyyy", { locale: sv }));
    }

    if (view === "week") {
      const weekStart = startOfWeek(safeDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(safeDate, { weekStartsOn: 1 });
      return `${format(weekStart, "d MMM", { locale: sv })} – ${format(
        weekEnd,
        "d MMM yyyy",
        { locale: sv },
      )}`;
    }

    return capitalizeWords(
      format(safeDate, "EEEE d MMMM yyyy", { locale: sv }),
    );
  }

  function renderViewSegment() {
    return (
      <div className="segment">
        {availableViews.includes("day") && (
          <button
            className={`segment-btn ${view === "day" ? "segment-active" : ""}`}
            onClick={() => setView("day")}
          >
            Dagsvy
          </button>
        )}
        {availableViews.includes("week") && (
          <button
            className={`segment-btn ${view === "week" ? "segment-active" : ""}`}
            onClick={() => setView("week")}
          >
            Veckovy
          </button>
        )}
        {availableViews.includes("month") && (
          <button
            className={`segment-btn ${view === "month" ? "segment-active" : ""}`}
            onClick={() => setView("month")}
          >
            Månadsvy
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`topbar ${allSchedules ? "topbar--all-schedules" : ""}`}>
      {allSchedules ? (
        <>
          <div className="topbar-all-schedules-row">
            <div className="topbar-heading topbar-heading--with-nav">
              <button className="nav-btn" onClick={onPrev}>
                ←
              </button>
              <p className="topbar-heading__subtitle">
                {getAllSchedulesSubtitle()}
              </p>
              <button className="nav-btn" onClick={onNext}>
                →
              </button>
            </div>

            <div className="topbar-all-schedules-actions">
              <button className="small-btn" onClick={onGoToday}>
                Idag
              </button>
              {renderViewSegment()}
            </div>
          </div>

          {showFilters ? (
            <div className="controls controls--all-schedules controls--all-schedules-filters">
              <input
                className="search"
                placeholder="Sök lärare, kurs, ort..."
                value={filters.searchQuery}
                onChange={(event) =>
                  onFilterChange?.("searchQuery", event.target.value)
                }
              />

              <select
                className="filter-select"
                value={filters.teacher}
                onChange={(event) =>
                  onFilterChange?.("teacher", event.target.value)
                }
              >
                <option value="">Alla lärare</option>
                {filterOptions.teachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={filters.course}
                onChange={(event) =>
                  onFilterChange?.("course", event.target.value)
                }
              >
                <option value="">Alla kurser</option>
                {filterOptions.courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={filters.location}
                onChange={(event) =>
                  onFilterChange?.("location", event.target.value)
                }
              >
                <option value="">Alla städer</option>
                {filterOptions.locations.map((locationValue) => (
                  <option key={locationValue} value={locationValue}>
                    {getSwedishLabel(locationValue)}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={filters.sortBy}
                onChange={(event) =>
                  onFilterChange?.("sortBy", event.target.value)
                }
              >
                <option value="name-asc">Sortera efter: Namn A-Ö</option>
                <option value="name-desc">Sortera efter: Namn Ö-A</option>
              </select>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="title-with-nav">
            <button className="nav-btn" onClick={onPrev}>
              ←
            </button>
            <div className="title">{title}</div>
            <button className="nav-btn" onClick={onNext}>
              →
            </button>
          </div>

          <div className="controls">
            {showFilters ? (
              <>
                <input
                  className="search"
                  placeholder="Sök lärare, kurs, ort..."
                  value={filters.searchQuery}
                  onChange={(event) =>
                    onFilterChange?.("searchQuery", event.target.value)
                  }
                />

                <select
                  className="filter-select"
                  value={filters.teacher}
                  onChange={(event) =>
                    onFilterChange?.("teacher", event.target.value)
                  }
                >
                  <option value="">Alla lärare</option>
                  {filterOptions.teachers.map((teacher) => (
                    <option key={teacher} value={teacher}>
                      {teacher}
                    </option>
                  ))}
                </select>

                <select
                  className="filter-select"
                  value={filters.course}
                  onChange={(event) =>
                    onFilterChange?.("course", event.target.value)
                  }
                >
                  <option value="">Alla kurser</option>
                  {filterOptions.courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>

                <select
                  className="filter-select"
                  value={filters.location}
                  onChange={(event) =>
                    onFilterChange?.("location", event.target.value)
                  }
                >
                  <option value="">Alla städer</option>
                  {filterOptions.locations.map((locationValue) => (
                    <option key={locationValue} value={locationValue}>
                      {getSwedishLabel(locationValue)}
                    </option>
                  ))}
                </select>

                <select
                  className="filter-select"
                  value={filters.period}
                  onChange={(event) =>
                    onFilterChange?.("period", event.target.value)
                  }
                >
                  <option value="all">Alla perioder</option>
                  <option value="today">Idag</option>
                  <option value="thisWeek">Denna vecka</option>
                  <option value="thisMonth">Denna månad</option>
                  <option value="next30Days">Nästa 30 dagar</option>
                </select>
              </>
            ) : (
              <>
                <button className="small-btn" onClick={onGoToday}>
                  Idag
                </button>
                {renderViewSegment()}

                <input className="search" placeholder="Sök..." />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default memo(Topbar);
