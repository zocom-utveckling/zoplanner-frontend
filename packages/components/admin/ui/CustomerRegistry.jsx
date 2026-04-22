import "./index.css";
import { useCustomers, useCurrentActor } from "@zoplanner/app-hooks";
import { useState, useEffect } from "react";

export function CustomerRegistry({ user }) {
  const {
    customers,
    loading,
    createCustomer,
    removeCustomer,
    selectedCustomer,
    setSelectedCustomerId,
  } = useCustomers();

  const { managerId, isLoadingActor } = useCurrentActor(user);

  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerCity, setNewCustomerCity] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);

  const [filters, setFilters] = useState({
    mine: false,
    cities: [],
    subjects: [],
  });

  // 🔥 NEW: Beställningar state (frontend only for now)
  const [orders, setOrders] = useState([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [newOrder, setNewOrder] = useState({
    courseName: "",
    startDate: "",
    endDate: "",
    totalHours: "",
    className: "",
  });

  const uniqueCities = [
    ...new Set(customers.map((c) => c.city).filter(Boolean)),
  ];

  useEffect(() => {
    const handleClickOutside = () => setOpenFilter(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredCustomers = customers
    .filter((c) =>
      (c.name || "").toLowerCase().startsWith(search.trim().toLowerCase()),
    )
    .filter((c) => {
      if (filters.mine) return c.managerId === managerId;
      return true;
    })
    .filter((c) => {
      if (filters.cities.length > 0) {
        return filters.cities.includes(c.city);
      }
      return true;
    });

  const handleCreateCustomer = async () => {
    if (!managerId) return;

    await createCustomer({
      name: newCustomerName,
      city: newCustomerCity,
      managerId,
    });

    setNewCustomerName("");
    setNewCustomerCity("");
  };

  // 🔥 NEW: skapa beställning
  const handleCreateOrder = () => {
    if (!selectedCustomer) return;

    if (!newOrder.courseName || !newOrder.startDate || !newOrder.endDate) {
      alert("Fyll i kursnamn och datum.");
      return;
    }

    const order = {
      id: Date.now(),
      customerId: selectedCustomer.id,
      ...newOrder,
      status: "draft",
    };

    setOrders((prev) => [...prev, order]);

    setNewOrder({
      courseName: "",
      startDate: "",
      endDate: "",
      totalHours: "",
      className: "",
    });

    setIsCreatingOrder(false);
  };

  if (loading || isLoadingActor) return <p>Laddar kunder...</p>;

  return (
    <div className="customer-registry">
      <div className="customer-registry__header">
        <h1>Kunder</h1>
        <button onClick={() => setIsCreating(true)}>+ Ny kund</button>
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

      <ul className="customer-registry__list">
        {filteredCustomers.map((c) => (
          <li
            key={c.id}
            onClick={() => setSelectedCustomerId(c.id)}
            className="customer-registry__item"
          >
            {c.name} - {c.city}
          </li>
        ))}
      </ul>

      {/* 🔥 CUSTOMER DETAIL */}
      {selectedCustomer && (
        <div className="customer-registry__detail">
          <h2>{selectedCustomer.name}</h2>
          <p>Stad: {selectedCustomer.city}</p>

          {/* 🔥 BESTÄLLNINGAR */}
          <h3>Beställningar</h3>

          <button onClick={() => setIsCreatingOrder(true)}>
            + Ny beställning
          </button>

          {isCreatingOrder && (
            <div className="customer-registry__order-form">
              <input
                placeholder="Kursnamn"
                value={newOrder.courseName}
                onChange={(e) =>
                  setNewOrder((p) => ({
                    ...p,
                    courseName: e.target.value,
                  }))
                }
              />
              <input
                type="date"
                value={newOrder.startDate}
                onChange={(e) =>
                  setNewOrder((p) => ({
                    ...p,
                    startDate: e.target.value,
                  }))
                }
              />
              <input
                type="date"
                value={newOrder.endDate}
                onChange={(e) =>
                  setNewOrder((p) => ({
                    ...p,
                    endDate: e.target.value,
                  }))
                }
              />
              <input
                placeholder="Antal timmar"
                value={newOrder.totalHours}
                onChange={(e) =>
                  setNewOrder((p) => ({
                    ...p,
                    totalHours: e.target.value,
                  }))
                }
              />
              <input
                placeholder="Klass (valfri)"
                value={newOrder.className}
                onChange={(e) =>
                  setNewOrder((p) => ({
                    ...p,
                    className: e.target.value,
                  }))
                }
              />

              <button onClick={handleCreateOrder}>Spara beställning</button>
            </div>
          )}

          {/* 🔥 LISTA */}
          <ul>
            {orders
              .filter((o) => o.customerId === selectedCustomer.id)
              .map((o) => (
                <li key={o.id}>
                  <strong>{o.courseName}</strong>
                  <br />
                  {o.startDate} → {o.endDate}
                  <br />
                  {o.totalHours}h
                  <br />
                  <button
                    onClick={() => {
                      console.log("👉 Starta planering", o);
                      // här kopplar vi planner sen
                    }}
                  >
                    Planera
                  </button>
                </li>
              ))}
          </ul>

          <button onClick={() => setSelectedCustomerId(null)}>Stäng</button>
        </div>
      )}
    </div>
  );
}
