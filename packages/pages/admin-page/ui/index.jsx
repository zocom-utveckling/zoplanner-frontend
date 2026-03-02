import "./index.css";
function AdminPage() {
  return (
    <>
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
      </div>
    </>
  );
}
export { AdminPage };
