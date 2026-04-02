import "./index.css";
import { useState } from "react";

export function CourseRegistry() {
  // TEMP DATA (ersätt senare med hook)
  const managerId = 1;

  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "React Grundkurs",
      customer: "Norrsken Gymnasium",
      managerId: 1,
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    },
    {
      id: 2,
      name: "Node.js Backend",
      customer: "Södervik Skola",
      managerId: 2,
      startDate: "2026-02-01",
      endDate: "2026-03-01",
    },
  ]);

  const [filters, setFilters] = useState({
    mine: false,
    status: "all", // "all" | "ongoing" | "completed"
  });

  const [isCreating, setIsCreating] = useState(false);

  const [newCourse, setNewCourse] = useState({
    name: "",
    customer: "",
    startDate: "",
    endDate: "",
  });

  const today = new Date();

  const getStatus = (course) => {
    const start = new Date(course.startDate);
    const end = new Date(course.endDate);

    if (today >= start && today <= end) return "ongoing";
    if (today > end) return "completed";
    return "upcoming";
  };

  const filteredCourses = courses
    .filter((c) => {
      if (filters.mine) {
        return c.managerId === managerId;
      }
      return true;
    })
    .filter((c) => {
      if (filters.status === "all") return true;
      return getStatus(c) === filters.status;
    });

  const handleCreateCourse = (e) => {
    e.preventDefault();

    const newItem = {
      ...newCourse,
      id: Date.now(),
      managerId,
    };

    setCourses((prev) => [...prev, newItem]);

    setNewCourse({
      name: "",
      customer: "",
      startDate: "",
      endDate: "",
    });

    setIsCreating(false);
  };

  return (
    <div className="course-registry">
      <div className="course-registry__header">
        <h1>Kurser</h1>
        <button onClick={() => setIsCreating(true)}>+ Ny kurs</button>
      </div>

      {/* FILTERS */}
      <div className="course-registry__filters">
        <button
          onClick={() => setFilters((prev) => ({ ...prev, mine: !prev.mine }))}
          className={filters.mine ? "active" : ""}
        >
          Mina
        </button>

        <button
          onClick={() => setFilters((prev) => ({ ...prev, status: "all" }))}
          className={filters.status === "all" ? "active" : ""}
        >
          Alla
        </button>

        <button
          onClick={() => setFilters((prev) => ({ ...prev, status: "ongoing" }))}
          className={filters.status === "ongoing" ? "active" : ""}
        >
          Pågående
        </button>

        <button
          onClick={() =>
            setFilters((prev) => ({ ...prev, status: "completed" }))
          }
          className={filters.status === "completed" ? "active" : ""}
        >
          Avslutade
        </button>
      </div>

      {/* CREATE FORM */}
      {isCreating && (
        <form className="course-registry__form" onSubmit={handleCreateCourse}>
          <input
            type="text"
            placeholder="Kursnamn"
            value={newCourse.name}
            onChange={(e) =>
              setNewCourse((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Kund"
            value={newCourse.customer}
            onChange={(e) =>
              setNewCourse((prev) => ({
                ...prev,
                customer: e.target.value,
              }))
            }
          />

          <input
            type="date"
            value={newCourse.startDate}
            onChange={(e) =>
              setNewCourse((prev) => ({
                ...prev,
                startDate: e.target.value,
              }))
            }
          />

          <input
            type="date"
            value={newCourse.endDate}
            onChange={(e) =>
              setNewCourse((prev) => ({
                ...prev,
                endDate: e.target.value,
              }))
            }
          />

          <button type="submit">Spara</button>
        </form>
      )}

      {/* LIST */}
      <ul className="course-registry__list">
        {filteredCourses.length === 0 ? (
          <li className="course-registry__empty">
            Inga kurser matchar filtret.
          </li>
        ) : (
          filteredCourses.map((c) => (
            <li key={c.id} className="course-registry__item">
              <span>
                {c.name} – {c.customer}
              </span>
              <span>
                {c.startDate} → {c.endDate}
              </span>
              <span>{getStatus(c)}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
