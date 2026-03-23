import { memo } from "react";
import { format } from "date-fns";
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

  return (
    <div className={`topbar ${allSchedules ? "topbar--all-schedules" : ""}`}>
      <div className={allSchedules ? "topbar-heading" : "title-with-nav"}>
        {allSchedules ? (
          <>
            <h1 className="topbar-heading__title">Allas scheman</h1>
            <p className="topbar-heading__subtitle">
              {capitalizeWords(
                format(focusDate || new Date(), "EEEE d MMMM", { locale: sv }),
              )}
            </p>
          </>
        ) : (
          <>
            <button className="nav-btn" onClick={onPrev}>
              ←
            </button>
            <div className="title">{title}</div>
            <button className="nav-btn" onClick={onNext}>
              →
            </button>
          </>
        )}
      </div>

      <div
        className={`controls ${allSchedules ? "controls--all-schedules" : ""}`}
      >
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

            {allSchedules ? (
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
            ) : null}
          </>
        ) : (
          <>
            <button className="small-btn" onClick={onGoToday}>
              Idag
            </button>
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
                  className={`segment-btn ${
                    view === "month" ? "segment-active" : ""
                  }`}
                  onClick={() => setView("month")}
                >
                  Månadsvy
                </button>
              )}
            </div>

            <input className="search" placeholder="Sök..." />
          </>
        )}
      </div>
    </div>
  );
}

export default memo(Topbar);
