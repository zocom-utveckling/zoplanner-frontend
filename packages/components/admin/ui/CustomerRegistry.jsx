import { useCustomers, useCurrentManagerId } from "@zoplanner/app-hooks";

export function CustomerRegistry() {
  const { customers, loading } = useCustomers();
  const managerId = useCurrentManagerId();

  const myCustomers = customers.filter((c) => c.managerId === managerId);

  if (loading) return <p>Laddar kunder...</p>;
  if (!myCustomers.length) return <p>Inga kunder hittades.</p>;

  return (
    <div>
      <h1>Kunder</h1>

      <button>+ Ny kund</button>

      <ul>
        {myCustomers.map((c) => (
          <li key={c.id}>
            {c.name} - {c.city}
          </li>
        ))}
      </ul>
    </div>
  );
}
