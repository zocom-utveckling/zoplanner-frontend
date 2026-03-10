export default function Topbar({
  title,
  view,
  setView,
  availableViews = ["day", "week", "month"],
  showFilters = false,
  filterOptions = { teachers: [], availability: [], cities: [] },
  filters = { teacher: "", availability: "", city: "" },
  onFilterChange,
  onGoToday,
  onPrev,
  onNext,
}) {
  function getAvailabilityLabel(value) {
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
              value={filters.availability}
              onChange={(event) =>
                onFilterChange?.("availability", event.target.value)
              }
            >
              <option value="">All tillgänglighet</option>
              {filterOptions.availability.map((availabilityValue) => (
                <option key={availabilityValue} value={availabilityValue}>
                  {getAvailabilityLabel(availabilityValue)}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filters.city}
              onChange={(event) => onFilterChange?.("city", event.target.value)}
            >
              <option value="">Alla städer</option>
              {filterOptions.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
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
