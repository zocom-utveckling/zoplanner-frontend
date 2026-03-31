export function CustomerRegistry() {
  const customers = ["AcadeMedia", "NTI Gymnasiet", "Yrgo"];

  return (
    <div>
      <h1>Kunder</h1>

      <button>+ Ny kund</button>

      <ul>
        {customers.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
