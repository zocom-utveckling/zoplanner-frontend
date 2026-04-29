export default function CustomerDetailsModal({
  customer,
  orders,
  onClose,
  onDelete,
  onStartPlanning,
}) {
  if (!customer) return null;

  const customerOrders = orders.filter((o) => o.customerId === customer.id);

  return (
    <div
      className="customer-registry__modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="customer-registry__modal">
        <div className="customer-registry__modal-header">
          <div>
            <h2 className="customer-registry__modal-title">{customer.name}</h2>
            <p className="customer-registry__modal-meta">
              Stad: {customer.city}
            </p>
          </div>
          <button
            className="customer-registry__modal-close"
            type="button"
            onClick={onClose}
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
            Kontaktuppgifter stöds inte i backend ännu — planerat för framtida
            version.
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

          {customerOrders.length === 0 ? (
            <p className="customer-registry__empty">Inga beställningar ännu.</p>
          ) : (
            <ul className="customer-registry__modal-orders">
              {customerOrders.map((o) => (
                <li key={o.id} className="customer-registry__modal-order-item">
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
                    onClick={() => onStartPlanning?.(o)}
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
            onClick={onDelete}
          >
            Radera kund
          </button>

          <button
            className="customer-registry__order-btn"
            type="button"
            onClick={onClose}
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}
