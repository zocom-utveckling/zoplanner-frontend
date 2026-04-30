import "./index.css";
import { useEffect, useMemo, useState } from "react";

const EMPTY_RECORDS = [];
const EMPTY_FILTERS = [];
const EMPTY_FILTER_STATE = {};

export function RegistrySearchFilter({
  search,
  onSearchChange,
  searchPlaceholder = "Sök...",
  showFilters,
  onToggleFilters,
  filters = EMPTY_FILTERS,
  citySourceRecords = EMPTY_RECORDS,
  filterState = EMPTY_FILTER_STATE,
  onToggleFilter,
  onMultiFilterToggle,
  onResetFilters,
}) {
  const [openFilter, setOpenFilter] = useState(null);

  useEffect(() => {
    if (!showFilters) {
      setOpenFilter(null);
    }
  }, [showFilters]);

  const cityOptions = useMemo(() => {
    const cities = (citySourceRecords ?? [])
      .map((record) => record.city)
      .filter(Boolean)
      .map((city) => city.trim())
      .filter((city) => city.length > 0);

    return [...new Set(cities)].sort((a, b) => a.localeCompare(b, "sv"));
  }, [citySourceRecords]);

  const resolvedFilters = filters.map((filter) => {
    if (filter.type === "multi" && filter.key === "cities") {
      return {
        ...filter,
        options: cityOptions.map((city) => ({
          label: city,
          value: city,
        })),
      };
    }

    if (filter.type === "multi") {
      const normalizedOptions = (filter.options ?? []).map((option) => {
        if (typeof option === "string") {
          return { label: option, value: option };
        }

        return {
          label: option.label ?? option.value,
          value: option.value,
        };
      });

      return {
        ...filter,
        options: normalizedOptions,
      };
    }

    return {
      ...filter,
      options: filter.options ?? [],
    };
  });

  const hasActiveFilters = resolvedFilters.some((filter) => {
    if (filter.type === "toggle") return Boolean(filterState[filter.key]);
    if (filter.type === "multi") return filterState[filter.key]?.length > 0;
    return false;
  });

  const activeChips = resolvedFilters.flatMap((filter) => {
    if (filter.type === "multi") {
      return (filterState[filter.key] ?? []).map((value) => {
        const matchedOption = (filter.options ?? []).find(
          (option) => option.value === value,
        );

        return {
          key: `${filter.key}-${value}`,
          label: matchedOption?.label ?? value,
          onRemove: () => onMultiFilterToggle(filter.key, value),
        };
      });
    }

    return [];
  });

  return (
    <div className="registry-search-filter">
      <div className="registry-search-filter__bar">
        <div className="registry-search-filter__left">
          <button
            type="button"
            className="registry-search-filter__toggle"
            onClick={onToggleFilters}
          >
            {showFilters ? "Filter ×" : "Filtrera"}
          </button>

          {showFilters ? (
            <div className="registry-search-filter__controls">
              <button
                type="button"
                onClick={() => {
                  setOpenFilter(null);
                  onResetFilters();
                }}
                className={!hasActiveFilters ? "active" : ""}
              >
                Alla
              </button>

              {resolvedFilters.map((filter) => {
                const isActive =
                  filter.type === "toggle"
                    ? Boolean(filterState[filter.key])
                    : filterState[filter.key]?.length > 0;

                if (filter.type === "toggle") {
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => onToggleFilter(filter.key)}
                      className={isActive ? "active" : ""}
                    >
                      {filter.label}
                    </button>
                  );
                }

                if (filter.type === "multi") {
                  return (
                    <div
                      key={filter.key}
                      className="registry-search-filter__dropdown-trigger"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFilter((prev) =>
                            prev === filter.key ? null : filter.key,
                          )
                        }
                        className={
                          isActive || openFilter === filter.key ? "active" : ""
                        }
                      >
                        {filter.label}
                      </button>

                      {openFilter === filter.key ? (
                        <div className="registry-search-filter__cities-panel">
                          <button
                            type="button"
                            className="registry-search-filter__dropdown-close"
                            onClick={() => setOpenFilter(null)}
                            aria-label="Stäng filter"
                          >
                            ×
                          </button>

                          {filter.demoNote ? (
                            <p className="registry-search-filter__future-note">
                              {filter.demoNote}
                            </p>
                          ) : null}

                          <div className="registry-search-filter__cities-list">
                            {filter.options.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                className={
                                  filterState[filter.key]?.includes(
                                    option.value,
                                  )
                                    ? "active"
                                    : ""
                                }
                                onClick={() =>
                                  onMultiFilterToggle(filter.key, option.value)
                                }
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ) : null}
        </div>

        <input
          className="registry-search-filter__search"
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {activeChips.length > 0 && (
        <div className="registry-search-filter__active-filters">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="registry-search-filter__chip"
              onClick={chip.onRemove}
            >
              {chip.label} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
