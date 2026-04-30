export function CustomerOrderCreateForm({
  customers,
  newOrder,
  setNewOrder,
  onCancel,
  onSubmit,
  onStartPlanning,
  onOpenCreateCustomer,
}) {
  return (
    <form
      className="customer-registry__order-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="customer-registry__order-form-header">
        <h2>Ny beställning</h2>
        <button
          className="customer-registry__modal-close"
          type="button"
          onClick={onCancel}
          aria-label="Avbryt"
        >
          ×
        </button>
      </div>

      <select
        value={newOrder.customerId}
        onChange={(e) => {
          if (e.target.value === "__new_customer__") {
            onOpenCreateCustomer();
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
          onClick={onCancel}
        >
          Avbryt
        </button>

        <button
          className="customer-registry__order-form-plan"
          type="button"
          onClick={onStartPlanning}
        >
          Till planeringen
        </button>

        <button type="submit">Spara beställning</button>
      </div>
    </form>
  );
}

export default CustomerOrderCreateForm;
