import "./index.css";
function AdminPage() {
  return (
    <>
      <div className="container">
        <div className="header">
          <h1>Adminpanelen</h1>
        </div>
        <div>
          <div className="admin-grid">
            <section className="admin-card">
              <h3>Kurser</h3>
              <text>Idé/förslag under utformning:</text>
              <text>
                {" "}
                Här kommer man kunna registrera, redigera och söka kurser{" "}
              </text>
            </section>
            <section className="admin-card">
              <h3>Konsulter</h3>
              <text>Idé/förslag under utformning:</text>
              <text>
                {" "}
                Här kommer man kunna registrera, redigera och söka
                konsulter{" "}
              </text>
            </section>
            <section className="admin-card">
              <h3>Kunder</h3>
              <text>Idé/förslag under utformning:</text>
              <text>
                {" "}
                Här kommer man kunna registrera, redigera, söka kunder och
                beställningar{" "}
              </text>
            </section>
            <section className="admin-card">
              <h3>Planering</h3>
              <text>Idé/förslag under utformning:</text>
              <text>
                {" "}
                Här kommer det finnas verktyg för att lägga schema, ändra
                enstaka lektioner, skapa uppdrag och tilldela{" "}
              </text>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
export { AdminPage };
