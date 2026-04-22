import "./index.css";
import { useCustomers, useCurrentActor } from "@zoplanner/app-hooks";
import { useState, useEffect } from "react";
import { createPlanningOrder } from "@zoplanner/admin";

const emptyOrder = {
  courseName: "",
  startDate: "",
  endDate: "",
  totalHours: "",
  className: "",
};

export function CustomerRegistry({ user, onStartPlanning }) {
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

  const [orders, setOrders] = useState([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState(emptyOrder);

  const uniqueCities = [
    ...new Set(customers.map((c) => c.city).filter(Boolean)),
  ];

  useEffect(() => {
    const handleClickOutside = () => setOpenFilter(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setNewOrder(emptyOrder);
    setIsCreatingOrder(false);
  }, [selectedCustomer?.id]);

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

  const handleCreateOrder = async () => {
    if (!selectedCustomer) return;

    if (
      !newOrder.courseName ||
      !newOrder.startDate ||
      !newOrder.endDate ||
      !newOrder.className ||
      !newOrder.totalHours
    ) {
      alert("Fyll i kursnamn, klass, datum och antal timmar.");
      return;
    }

    try {
      const order = await createPlanningOrder({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        className: newOrder.className,
        courseName: newOrder.courseName,
        startDate: newOrder.startDate,
        endDate: newOrder.endDate,
        totalHours: newOrder.totalHours,
      });

      setOrders((prev) => [...prev, order]);
      setNewOrder(emptyOrder);
      setIsCreatingOrder(false);
    } catch (error) {
      console.error("❌ Failed to create planning order:", error);
      setNewOrder(emptyOrder);
      setIsCreatingOrder(false);
      alert("Kunde inte skapa beställning.");
    }
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

      {selectedCustomer && (
        <div className="customer-registry__detail">
          <h2>{selectedCustomer.name}</h2>
          <p>Stad: {selectedCustomer.city}</p>

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
                placeholder="Klass"
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
                      onStartPlanning?.(o);
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
