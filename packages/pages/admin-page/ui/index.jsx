import "./index.css";

function AdminPage() {
  return (
    <>
<<<<<<< HEAD
      <h1>Adminpanelen</h1>;
      <div className="admin-grid">
        <section className="admin-card">
          <h1>Uppdrag</h1>
        </section>
        <section className="admin-card">
          <h1>Schema</h1>
        </section>
        <section className="admin-card">
          <h1>Lärare</h1>
        </section>
        <section className="admin-card">
          <h1>Planering</h1>
        </section>
=======
      <div className="container">
        <div className="header">
          <h1>Adminpanelen</h1>
        </div>
        <div>
          <div className="admin-grid">
            <section className="admin-card">
              <h3>Kurser</h3>
              <p>Idé/förslag under utformning:</p>
              <p> Här kommer man kunna registrera, redigera och söka kurser </p>
            </section>
            <section className="admin-card">
              <h3>Konsulter</h3>
              <p>Idé/förslag under utformning:</p>
              <p>
                {" "}
                Här kommer man kunna registrera, redigera och söka
                konsulter{" "}
              </p>
            </section>
            <section className="admin-card">
              <h3>Kunder</h3>
              <p>Idé/förslag under utformning:</p>
              <p>
                {" "}
                Här kommer man kunna registrera, redigera, söka kunder och
                beställningar{" "}
              </p>
            </section>
            <section className="admin-card">
              <h3>Planering</h3>
              <p>Idé/förslag under utformning:</p>
              <p>
                {" "}
                Här kommer det finnas verktyg för att lägga schema, ändra
                enstaka lektioner, skapa uppdrag och tilldela{" "}
              </p>
            </section>
          </div>
        </div>
>>>>>>> 5dd833e (style(admin-page): minor change in text)
      </div>
    </>
  );
}
export { AdminPage };
