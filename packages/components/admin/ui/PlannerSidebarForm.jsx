import "./index.css";
export function PlannerSidebarForm() {
  return (
    <div className="planner-sidebar-form">
      <label>
        Kursnamn
        <input type="text" placeholder="Till exempel React grundkurs" />
      </label>

      <label>
        Startdatum
        <input type="date" />
      </label>

      <label>
        Slutdatum
        <input type="date" />
      </label>

      <div className="weekday-group">
        <span>Veckodagar</span>

        <label>
          <input type="checkbox" /> Måndag
        </label>
        <label>
          <input type="checkbox" /> Tisdag
        </label>
        <label>
          <input type="checkbox" /> Onsdag
        </label>
        <label>
          <input type="checkbox" /> Torsdag
        </label>
        <label>
          <input type="checkbox" /> Fredag
        </label>
      </div>

      <button type="button">Generera schemautkast</button>
    </div>
  );
}
