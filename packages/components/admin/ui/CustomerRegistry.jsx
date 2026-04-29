import "./index.css";
import { useCustomers, useCurrentActor } from "@zoplanner/app-hooks";
import { useState } from "react";
import { createPlanningOrder } from "@zoplanner/admin";
import { classService } from "@zoplanner/api";
import { RegistrySearchFilter } from "./RegistrySearchFilter";

const emptyOrder = {
  customerId: "",
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
    selectedCustomer,
    setSelectedCustomerId,
    removeCustomer,
  } = useCustomers();

  const { managerId, isLoadingActor } = useCurrentActor(user);

  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerCity, setNewCustomerCity] = useState("");
  const [newCustomerContactName, setNewCustomerContactName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    mine: false,
    cities: [],
  });

  const [orders, setOrders] = useState([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState(emptyOrder);
  const [startPlanningOnOrderSave, setStartPlanningOnOrderSave] =
    useState(false);

  const [modalCustomer, setModalCustomer] = useState(null);

  const resetNewCustomerForm = () => {
    setNewCustomerName("");
    setNewCustomerCity("");
    setNewCustomerContactName("");
    setNewCustomerPhone("");
    setNewCustomerEmail("");
    setNewCustomerAddress("");
  };

  const closeCreateCustomer = () => {
    setIsCreating(false);
    resetNewCustomerForm();
  };

  const closeCreateOrder = () => {
    setIsCreatingOrder(false);
    setNewOrder(emptyOrder);
    setStartPlanningOnOrderSave(false);
  };

  const openCreateCustomerFromOrder = () => {
    setIsCreatingOrder(false);
    setIsCreating(true);
  };

  const handleToggleCreateCustomer = () => {
    setIsCreating((prev) => !prev);
    setIsCreatingOrder(false);
    setStartPlanningOnOrderSave(false);
    setShowFilters(false);
    setSearch("");
    setModalCustomer(null);
    setSelectedCustomerId(null);
  };

  const handleToggleCreateOrder = () => {
    setIsCreatingOrder((prev) => !prev);
    setIsCreating(false);
    setShowFilters(false);
    setSearch("");
    setModalCustomer(null);
    setSelectedCustomerId(null);
  };

  const toggleMine = () => {
    setFilters((prev) => ({
      ...prev,
      mine: !prev.mine,
    }));
  };

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

  const resetFilters = () => {
    setFilters({
      mine: false,
      cities: [],
    });
  };

  // 👇 lägg här

  console.log("managerId (actor):", managerId);

  console.log(
    "customers:",
    customers.map((c) => c.managerId),
  );

  const filteredCustomers = customers
    .filter((c) => {
      const name = (c.name || "").trim().toUpperCase();
      return name && !name.startsWith("UTKAST");
    })
    .filter((c) =>
      (c.name || "").toLowerCase().startsWith(search.trim().toLowerCase()),
    )
    .filter((c) => {
      if (!filters.mine) return true;
      return Number(c.managerId) === Number(managerId);
    })
    .filter((c) => {
      if (filters.cities.length > 0) return filters.cities.includes(c.city);
      return true;
    });

  const handleCreateCustomer = async ({ nextStep = null } = {}) => {
    if (!managerId) return;

    try {
      const customer = await createCustomer({
        name: newCustomerName,
        city: newCustomerCity,
        managerId,
      });

      resetNewCustomerForm();
      setIsCreating(false);

      if (nextStep === "order" || nextStep === "planning") {
        setNewOrder((prev) => ({
          ...emptyOrder,
          ...prev,
          customerId: String(customer.id),
        }));
        setStartPlanningOnOrderSave(nextStep === "planning");
        setIsCreatingOrder(true);
      }

      return customer;
    } catch (error) {
      console.error("❌ Failed to create customer:", error);
      alert("Kunde inte skapa kund.");
      return null;
    }
  };

  const handleCreateOrder = async ({ startPlanning = false } = {}) => {
    const selectedOrderCustomer = customers.find(
      (customer) => customer.id === Number(newOrder.customerId),
    );

    if (!selectedOrderCustomer) {
      alert("Välj kund.");
      return;
    }

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

    const shouldStartPlanning = startPlanning || startPlanningOnOrderSave;

    try {
      const order = await createPlanningOrder({
        customerId: selectedOrderCustomer.id,
        customerName: selectedOrderCustomer.name,
        className: newOrder.className,
        courseName: newOrder.courseName,
        startDate: newOrder.startDate,
        endDate: newOrder.endDate,
        totalHours: newOrder.totalHours,
        managerId,
      });

      setOrders((prev) => [...prev, order]);
      setNewOrder(emptyOrder);
      setIsCreatingOrder(false);
      setStartPlanningOnOrderSave(false);

      if (shouldStartPlanning) {
        onStartPlanning?.(order);
      }

      return order;
    } catch (error) {
      console.error("❌ Failed to create planning order:", error);
      alert("Kunde inte skapa beställning.");
      return null;
    }
  };

  if (loading || isLoadingActor) return <p>Laddar kunder...</p>;

  return (
    <div className="customer-registry">
      <div className="customer-registry__header">
        <h1>Kundregister</h1>

        <button
          className="customer-registry__add-button"
          onClick={handleToggleCreateCustomer}
        >
          + Ny kund
        </button>

        <button
          className="customer-registry__add-button"
          onClick={handleToggleCreateOrder}
        >
          + Ny beställning
        </button>
      </div>

      <div className="customer-registry__main">
        {!isCreating && !isCreatingOrder && (
          <RegistrySearchFilter
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Sök kund..."
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((prev) => !prev)}
            citySourceRecords={customers}
            filters={[
              { key: "mine", label: "Mina", type: "toggle" },
              {
                key: "cities",
                label: "Städer",
                type: "multi",
              },
            ]}
            filterState={filters}
            onToggleFilter={(key) =>
              setFilters((prev) => ({
                ...prev,
                [key]: !prev[key],
              }))
            }
            onMultiFilterToggle={toggleMultiFilter}
            onResetFilters={resetFilters}
          />
        )}

        {isCreating && (
          <form
            className="customer-registry__form"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateCustomer();
            }}
          >
            <div className="customer-registry__form-header">
              <h2>Ny kund</h2>
              <button
                className="customer-registry__modal-close"
                type="button"
                onClick={closeCreateCustomer}
                aria-label="Avbryt"
              >
                ×
              </button>
            </div>

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

            <h3 className="customer-registry__modal-section-title">
              Kontaktuppgifter
            </h3>
            <p className="customer-registry__modal-future-note">
              Demo: Kontaktuppgifter visas bara lokalt i formuläret tills det
              finns backendstöd.
            </p>

            <input
              type="text"
              placeholder="Kontaktperson"
              value={newCustomerContactName}
              onChange={(e) => setNewCustomerContactName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Telefonnummer"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
            />

            <input
              type="email"
              placeholder="E-postadress"
              value={newCustomerEmail}
              onChange={(e) => setNewCustomerEmail(e.target.value)}
            />

            <input
              type="text"
              placeholder="Adress"
              value={newCustomerAddress}
              onChange={(e) => setNewCustomerAddress(e.target.value)}
            />

            <div className="customer-registry__form-actions">
              <button
                className="customer-registry__form-cancel"
                type="button"
                onClick={closeCreateCustomer}
              >
                Avbryt
              </button>
              <button
                className="customer-registry__form-order"
                type="button"
                onClick={() => handleCreateCustomer({ nextStep: "order" })}
              >
                Lägg till beställning
              </button>
              <button
                className="customer-registry__form-plan"
                type="button"
                onClick={() => handleCreateCustomer({ nextStep: "planning" })}
              >
                Till planeringen
              </button>
              <button type="submit">Spara kund</button>
            </div>
          </form>
        )}

        {isCreatingOrder && (
          <form
            className="customer-registry__order-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateOrder();
            }}
          >
            <div className="customer-registry__order-form-header">
              <h2>Ny beställning</h2>
              <button
                className="customer-registry__modal-close"
                type="button"
                onClick={closeCreateOrder}
                aria-label="Avbryt"
              >
                ×
              </button>
            </div>

            <select
              value={newOrder.customerId}
              onChange={(e) => {
                if (e.target.value === "__new_customer__") {
                  openCreateCustomerFromOrder();
                  return;
                }

                setNewOrder((p) => ({
                  ...p,
                  customerId: e.target.value,
                }));
              }}
            >
              <option value="__new_customer__">+ Lägg till ny kund</option>
              <option value="">Välj kund</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

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
              placeholder="Klass"
              value={newOrder.className}
              onChange={(e) =>
                setNewOrder((p) => ({
                  ...p,
                  className: e.target.value,
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

            <div className="customer-registry__order-form-actions">
              <button
                className="customer-registry__order-form-cancel"
                type="button"
                onClick={closeCreateOrder}
              >
                Avbryt
              </button>
              <button
                className="customer-registry__order-form-plan"
                type="button"
                onClick={() => handleCreateOrder({ startPlanning: true })}
              >
                Till planeringen
              </button>
              <button type="submit">Spara beställning</button>
            </div>
          </form>
        )}

        {!isCreating && !isCreatingOrder && (
          <div className="customer-registry__list-container">
            <ul className="customer-registry__list">
              {filteredCustomers.map((c) => (
                <li key={c.id} className="customer-registry__item">
                  <div className="customer-registry__item-content">
                    <p className="customer-registry__item-title">{c.name}</p>
                    <p className="customer-registry__item-subtitle">{c.city}</p>
                  </div>
                  <button
                    className="profile-page-list-btn"
                    type="button"
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setModalCustomer(c);
                    }}
                  >
                    Mer info
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {modalCustomer && (
          <div
            className="customer-registry__modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalCustomer(null);
            }}
          >
            <div className="customer-registry__modal">
              <div className="customer-registry__modal-header">
                <div>
                  <h2 className="customer-registry__modal-title">
                    {modalCustomer.name}
                  </h2>
                  <p className="customer-registry__modal-meta">
                    Stad: {modalCustomer.city}
                  </p>
                </div>
                <button
                  className="customer-registry__modal-close"
                  type="button"
                  onClick={() => setModalCustomer(null)}
                  aria-label="Stäng"
                >
                  ×
                </button>
              </div>

              <div>
                <h3 className="customer-registry__modal-section-title">
                  Kontaktuppgifter
                </h3>
                <p className="customer-registry__modal-future-note">
                  Kontaktuppgifter stöds inte i backend ännu — planerat för
                  framtida version.
                </p>
                <dl className="customer-registry__modal-contact">
                  <div className="customer-registry__modal-contact-row">
                    <dt>Kontaktperson</dt>
                    <dd>—</dd>
                  </div>
                  <div className="customer-registry__modal-contact-row">
                    <dt>Telefonnummer</dt>
                    <dd>—</dd>
                  </div>
                  <div className="customer-registry__modal-contact-row">
                    <dt>E-postadress</dt>
                    <dd>—</dd>
                  </div>
                  <div className="customer-registry__modal-contact-row">
                    <dt>Adress</dt>
                    <dd>—</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="customer-registry__modal-section-title">
                  Beställningar
                </h3>
                {orders.filter((o) => o.customerId === modalCustomer.id)
                  .length === 0 ? (
                  <p className="customer-registry__empty">
                    Inga beställningar ännu.
                  </p>
                ) : (
                  <ul className="customer-registry__modal-orders">
                    {orders
                      .filter((o) => o.customerId === modalCustomer.id)
                      .map((o) => (
                        <li
                          key={o.id}
                          className="customer-registry__modal-order-item"
                        >
                          <div>
                            <p className="customer-registry__modal-order-title">
                              {o.courseName}
                            </p>
                            <p className="customer-registry__modal-order-meta">
                              {o.startDate} – {o.endDate} · {o.totalHours}h
                            </p>
                          </div>
                          <button
                            className="profile-page-list-btn"
                            type="button"
                            onClick={() => {
                              onStartPlanning?.(o);
                              setModalCustomer(null);
                            }}
                          >
                            Planera
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="customer-registry__modal-footer">
                <button
                  className="customer-registry__modal-delete-btn"
                  type="button"
                  onClick={async () => {
                    try {
                      const classes = await classService.getByCustomerId(
                        modalCustomer.id,
                      );
                      if (classes && classes.length > 0) {
                        alert(
                          `Kunden "${modalCustomer.name}" kan inte raderas eftersom det finns kurser kopplade till kunden.`,
                        );
                        return;
                      }
                    } catch {
                      alert("Kunde inte kontrollera kundens kurser.");
                      return;
                    }
                    if (
                      !confirm(
                        `Radera kunden "${modalCustomer.name}"? Detta kan inte ångras.`,
                      )
                    )
                      return;
                    try {
                      await removeCustomer(modalCustomer.id);
                      setModalCustomer(null);
                    } catch {
                      alert("Kunde inte radera kunden.");
                    }
                  }}
                >
                  Radera kund
                </button>
                <button
                  className="customer-registry__order-btn"
                  type="button"
                  onClick={() => setModalCustomer(null)}
                >
                  Stäng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
