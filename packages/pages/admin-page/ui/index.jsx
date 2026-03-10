import "./index.css";
import PlannerMonthView from "../../../components/planning-tool/ui/PlannerMonthView";
import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

function AdminPage() {
  const [focusDate, setFocusDays] = useState(new Date());

  const monthGridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(focusDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(focusDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [focusDate]);

  const events = [
    {
      id: "1",
      title: "React grundkurs",
      type: "session",
      start: new Date(2026, 2, 10),
      end: new Date(2026, 2, 10),
    },
    {
      id: "2",
      title: "Frontend Workshop",
      type: "session",
      start: new Date(2026, 2, 12),
      end: new Date(2026, 2, 12),
    },
    {
      id: "3",
      title: "Javascript pass",
      type: "session",
      start: new Date(2026, 2, 17),
      end: new Date(2026, 2, 17),
    },
  ];

  return (
    <>
      <div className="admin-container">
        <div className="admin-header">
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
          <div className="schemaplanerar-container">
            <div className="admin-header">
              <h1>Schemaplanerare</h1>
            </div>
            <PlannerMonthView
              monthGridDays={monthGridDays}
              focusDate={focusDate}
              events={events}
              onDayClick={(day) => console.log("clicked day", day)}
              onEventClick={(event) => console.log("clicked event", event)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
export { AdminPage };
