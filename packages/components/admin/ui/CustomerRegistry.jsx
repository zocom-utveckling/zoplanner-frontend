import "./index.css";
import { useCustomers, useCurrentManagerId } from "@zoplanner/app-hooks";
import { useState, useEffect } from "react";

export function CustomerRegistry() {
  const {
    customers,
    loading,
    createCustomer,
    removeCustomer,
    selectedCustomer,
    setSelectedCustomerId,
  } = useCustomers();
  const managerId = useCurrentManagerId();
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerCity, setNewCustomerCity] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [openFilter, setOpenFilter] = useState(null); // "city" | "subject"

  const [filters, setFilters] = useState({
    mine: false,
    cities: [],
    subjects: [],
  });

  // const myCustomers = customers.filter((c) => c.manager_id === managerId);
  // TEMP: backend returns managerId = 0 for all customers
  const myCustomers = customers;

  // TEMP: subject data does not exist in backend yet
  const uniqueSubjects = [];

  const uniqueCities = [
    ...new Set(customers.map((c) => c.city).filter(Boolean)),
  ];

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenFilter(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleMultiFilter = (key, value) => {
    setFilters((prev) => {
      const exists = prev[key].includes(value);

      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
      };
    });
  };

  const toggleMine = () => {
    setFilters((prev) => ({
      ...prev,
      mine: !prev.mine,
    }));
  };

  const resetFilters = () => {
    setFilters({
      mine: false,
      cities: [],
      subjects: [],
    });
  };

  const filteredCustomers = myCustomers
    .filter((c) =>
      (c.name || "").toLowerCase().startsWith(search.trim().toLowerCase()),
    )
    .filter((c) => {
      if (filters.mine) {
        return c.managerId === managerId;
      }
      return true;
    })
    .filter((c) => {
      if (filters.cities.length > 0) {
        return filters.cities.includes(c.city);
      }
      return true;
    });

  if (loading) return <p>Laddar kunder...</p>;

  const handleCreateCustomer = async () => {
    try {
      await createCustomer({
        name: newCustomerName,
        city: newCustomerCity,
        managerId,
      });
      setNewCustomerName("");
      setNewCustomerCity("");
    } catch (err) {
      console.error(err);
    }
  };
  console.log("openFilter:", openFilter);
  return (
    <div className="customer-registry">
      <div className="customer-registry__header">
        <h1>Kunder</h1>
        <button onClick={() => setIsCreating(true)}>+ Ny kund</button>
      </div>
      <button onClick={() => setShowFilters((prev) => !prev)}>Filtrera</button>

      {showFilters && (
        <div className="customer-registry__filters">
          <span onClick={toggleMine} className={filters.mine ? "active" : ""}>
            Mina
          </span>

          <span
            onClick={resetFilters}
            className={
              !filters.mine &&
              filters.cities.length === 0 &&
              filters.subjects.length === 0
                ? "active"
                : ""
            }
          >
            Alla
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenFilter(openFilter === "cities" ? null : "cities");
            }}
          >
            Stad
          </button>

          {openFilter === "cities" && (
            <div
              className="customer-registry__dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              {uniqueCities.map((city) => (
                <div
                  key={city}
                  onClick={() => toggleMultiFilter("cities", city)}
                  className={filters.cities.includes(city) ? "active" : ""}
                >
                  {city}
                </div>
              ))}
            </div>
          )}

          {/* SUBJECT FILTER (future) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenFilter(openFilter === "subjects" ? null : "subjects");
            }}
          >
            Ämnesområde
          </button>

          {openFilter === "subjects" && (
            <div className="customer-registry__dropdown">
              {uniqueSubjects.length === 0 ? (
                <p>Kommer från backend senare</p>
              ) : (
                uniqueSubjects.map((subject) => (
                  <div
                    key={subject}
                    onClick={() => toggleMultiFilter("subjects", subject)}
                    className={
                      filters.subjects.includes(subject) ? "active" : ""
                    }
                  >
                    {subject}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="customer-registry__active-filters">
        {filters.mine && (
          <span className="chip" onClick={toggleMine}>
            Mina ✕
          </span>
        )}

        {filters.cities.map((city) => (
          <span
            key={city}
            className="chip"
            onClick={() => toggleMultiFilter("cities", city)}
          >
            {city} ✕
          </span>
        ))}

        {filters.subjects.map((subject) => (
          <span
            key={subject}
            className="chip"
            onClick={() => toggleMultiFilter("subjects", subject)}
          >
            {subject} ✕
          </span>
        ))}
      </div>

      <input
        type="text"
        placeholder="Sök kund..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isCreating && (
        <form
          className="customer-registry__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateCustomer();
            setIsCreating(false);
          }}
        >
          <input
            type="text"
            placeholder="Kundnamn"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Stad"
            value={newCustomerCity}
            onChange={(e) => setNewCustomerCity(e.target.value)}
          />
          <button type="submit">Spara</button>
        </form>
      )}

      <div className="customer-registry__list-container">
        <ul className="customer-registry__list">
          {filteredCustomers.length === 0 ? (
            <li className="customer-registry__empty">
              {customers.length === 0
                ? "Inga kunder ännu. Klicka på + Ny kund för att lägga till."
                : "Inga kunder matchar din sökning eller filter."}
            </li>
          ) : (
            filteredCustomers.map((c) => (
              <li
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                style={{ cursor: "pointer" }}
                className="customer-registry__item"
              >
                <span>
                  {c.name} - {c.city}
                </span>
                <div className="customer-registry__actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const confirmed = window.confirm(
                        `Är du säker på att du vill ta bort ${c.name}?`,
                      );

                      if (confirmed) {
                        removeCustomer(c.id);
                      }
                    }}
                  >
                    Ta bort
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {selectedCustomer && (
        <div className="customer-registry__detail">
          <h2>{selectedCustomer.name}</h2>
          <p>Stad: {selectedCustomer.city}</p>

          <h3>Kurser</h3>
          <p>(kommer snart)</p>

          <h3>Konsulter</h3>
          <p>(kommer snart)</p>

          <h3>Kontakt</h3>
          <p>(kommer snart)</p>

          <button onClick={() => setSelectedCustomerId(null)}>Stäng</button>
        </div>
      )}
    </div>
  );
}
