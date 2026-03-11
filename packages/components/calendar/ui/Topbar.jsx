export default function Topbar({
  title,
  view,
  setView,
  availableViews = ["day", "week", "month"],
  showFilters = false,
  filterOptions = { teachers: [], courses: [], availability: [], locations: [] },
  filters = {
    teacher: "",
    course: "",
    availability: "",
    location: "",
    period: "all",
    searchQuery: "",
  },
  onFilterChange,
  onGoToday,
  onPrev,
  onNext,
}) {
  function getSwedishLabel(value) {
    if (value === "REMOTE") return "Distans";
    if (value === "ONSITE") return "På plats";
    if (value === "HYBRID") return "Hybrid";
    return value;
  }

  return (
    <div className="topbar">
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
              className="filter-select"
              value={filters.availability}
              onChange={(event) =>
                onFilterChange?.("availability", event.target.value)
              }
            >
              <option value="">Alla arbetsformer</option>
              {filterOptions.availability.map((availabilityValue) => (
                <option key={availabilityValue} value={availabilityValue}>
                  {getSwedishLabel(availabilityValue)}
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
              <option value="">Alla platser</option>
              {filterOptions.locations.map((locationValue) => (
                <option key={locationValue} value={locationValue}>
                  {getSwedishLabel(locationValue)}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filters.period}
              onChange={(event) => onFilterChange?.("period", event.target.value)}
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
