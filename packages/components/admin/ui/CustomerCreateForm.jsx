export function CustomerCreateForm({
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
  onSubmit,
  onCancel,
  onAddOrder,
  onStartPlanning,
}) {
  return (
    <form
      className="customer-registry__form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="customer-registry__form-header">
        <h2>Ny kund</h2>
        <button
          className="customer-registry__modal-close"
          type="button"
          onClick={onCancel}
        >
          ×
        </button>
      </div>

      <input
        placeholder="Kundnamn"
        value={newCustomerName}
        onChange={(e) => setNewCustomerName(e.target.value)}
      />

      <input
        placeholder="Stad"
        value={newCustomerCity}
        onChange={(e) => setNewCustomerCity(e.target.value)}
      />

      <h3>Kontaktuppgifter</h3>
      <p className="customer-registry__modal-future-note">
        Demo: Kontaktuppgifter visas bara lokalt i formuläret tills det finns
        backendstöd.
      </p>

      <input
        placeholder="Kontaktperson"
        value={newCustomerContactName}
        onChange={(e) => setNewCustomerContactName(e.target.value)}
      />

      <input
        placeholder="Telefonnummer"
        value={newCustomerPhone}
        onChange={(e) => setNewCustomerPhone(e.target.value)}
      />

      <input
        placeholder="E-postadress"
        value={newCustomerEmail}
        onChange={(e) => setNewCustomerEmail(e.target.value)}
      />

      <input
        placeholder="Adress"
        value={newCustomerAddress}
        onChange={(e) => setNewCustomerAddress(e.target.value)}
      />

      <div className="customer-registry__form-actions">
        <button type="button" onClick={onCancel}>
          Avbryt
        </button>

        <button type="button" onClick={onAddOrder}>
          Lägg till beställning
        </button>

        <button type="button" onClick={onStartPlanning}>
          Till planeringen
        </button>

        <button type="submit">Spara kund</button>
      </div>
    </form>
  );
}

export default CustomerCreateForm;
