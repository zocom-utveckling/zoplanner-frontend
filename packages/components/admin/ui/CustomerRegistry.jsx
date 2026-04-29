import "./index.css";
import { useCustomerRegistry } from "../hooks/useCustomerRegistry";
import { RegistrySearchFilter } from "./RegistrySearchFilter";
import CustomerDetailsModal from "./CustomerDetailsModal";
import CustomerCreateForm from "./CustomerCreateForm";
import CustomerOrderCreateForm from "./CustomerOrderCreateForm";

export function CustomerRegistry({ user, onStartPlanning }) {
  const {
    customers,
    loading,
    setSelectedCustomerId,
    isLoadingActor,
    citySourceRecords,

    newCustomerName,
    setNewCustomerName,
    newCustomerCity,
    setNewCustomerCity,
    newCustomerContactName,
    setNewCustomerContactName,
    newCustomerPhone,
    setNewCustomerPhone,
    newCustomerEmail,
    setNewCustomerEmail,
    newCustomerAddress,
    setNewCustomerAddress,
    isCreating,
    handleDeleteCustomer,

    search,
    setSearch,
    showFilters,
    setShowFilters,

    filters,
    setFilters,
    toggleMultiFilter,
    resetFilters,

    orders,
    isCreatingOrder,
    newOrder,
    setNewOrder,

    modalCustomer,
    setModalCustomer,

    closeCreateCustomer,
    closeCreateOrder,
    openCreateCustomerFromOrder,
    handleToggleCreateCustomer,
    handleToggleCreateOrder,
    handleCreateCustomer,
    handleCreateOrder,
    filteredCustomers,
  } = useCustomerRegistry({ user });
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
            citySourceRecords={citySourceRecords}
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
          <CustomerCreateForm
            newCustomerName={newCustomerName}
            setNewCustomerName={setNewCustomerName}
            newCustomerCity={newCustomerCity}
            setNewCustomerCity={setNewCustomerCity}
            newCustomerContactName={newCustomerContactName}
            setNewCustomerContactName={setNewCustomerContactName}
            newCustomerPhone={newCustomerPhone}
            setNewCustomerPhone={setNewCustomerPhone}
            newCustomerEmail={newCustomerEmail}
            setNewCustomerEmail={setNewCustomerEmail}
            newCustomerAddress={newCustomerAddress}
            setNewCustomerAddress={setNewCustomerAddress}
            onSubmit={handleCreateCustomer}
            onCancel={closeCreateCustomer}
            onAddOrder={() => handleCreateCustomer({ nextStep: "order" })}
            onStartPlanning={() =>
              handleCreateCustomer({ nextStep: "planning" })
            }
          />
        )}
        {isCreatingOrder && (
          <CustomerOrderCreateForm
            customers={customers}
            newOrder={newOrder}
            setNewOrder={setNewOrder}
            onCancel={closeCreateOrder}
            onSubmit={handleCreateOrder}
            onStartPlanning={() =>
              handleCreateOrder({ startPlanning: true, onStartPlanning })
            }
            onOpenCreateCustomer={openCreateCustomerFromOrder}
          />
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

        <CustomerDetailsModal
          customer={modalCustomer}
          orders={orders}
          onClose={() => setModalCustomer(null)}
          onDelete={handleDeleteCustomer}
          onStartPlanning={(order) => {
            onStartPlanning?.(order);
            setModalCustomer(null);
          }}
        />
      </div>
    </div>
  );
}
