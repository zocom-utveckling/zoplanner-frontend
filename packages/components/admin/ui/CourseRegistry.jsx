import "./index.css";
import { useEffect, useState } from "react";
import { useCurrentActor } from "@zoplanner/app-hooks";
import { assignmentService } from "@zoplanner/api";
import { dev } from "@zoplanner/admin";
import CourseDetailsModal from "./CourseDetailsModal";
import { loadPlanningDrafts } from "@zoplanner/planning-tool";

export function CourseRegistry({
  user,
  selectedIncompleteItem,
  onOpenConsultantMatching,
}) {
  const { managerId, isLoadingActor } = useCurrentActor(user);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  const drafts = loadPlanningDrafts();

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    mine: false,
    statuses: [],
  });

  useEffect(() => {
    async function loadAssignments() {
      try {
        const data = await assignmentService.getAll();
        setAssignments(data ?? []);
      } catch (error) {
        console.error("Failed to load assignments:", error);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    }

    loadAssignments();
  }, []);

  const today = new Date();

  const getStatus = (courseLike) => {
    if (courseLike?.status === "draft") return "draft";

    const start = new Date(courseLike.startDate);
    const end = new Date(courseLike.endDate);

    if (today >= start && today <= end) return "ongoing";
    if (today > end) return "completed";
    return "upcoming";
  };

  function getStatusLabel(status) {
    if (status === "draft") return "Utkast";
    if (status === "ongoing") return "Pågående";
    if (status === "completed") return "Avslutad";
    return "Kommande";
  }

  const courseRows = assignments.map((assignment) => ({
    id: assignment.id,
    assignment,
    isDraft: false,
    name: dev.getCourseNameForAssignment(assignment),
    customer:
      assignment.course?.className ||
      assignment.course?.customerName ||
      "Kund saknas",
    startDate: assignment.dateStart,
    endDate: assignment.dateEnd,
    sessions: assignment.sessions ?? [],
    consultantId: assignment.consultantId ?? null,
    managerId: assignment.managerId ?? null,
    status: getStatus({
      startDate: assignment.dateStart,
      endDate: assignment.dateEnd,
    }),
  }));

  const draftRows = drafts.map((draft) => ({
    id: `draft-${draft.id}`,
    draftId: draft.id,
    isDraft: true,
    name: draft.courseName || "Utkast",
    customer: "Ej vald",
    startDate: draft.startDate,
    endDate: draft.endDate,
    sessions: draft.sessionsDraft ?? [],
    managerId: null,
    status: "draft",
  }));

  const allCourses = [...courseRows, ...draftRows];

  const toggleMultiFilter = (key, value) => {
    setFilters((prev) => {
      const exists = prev[key].includes(value);

      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
      };
    });
  };

  const toggleMine = () => {
    setFilters((prev) => ({
      ...prev,
      mine: !prev.mine,
    }));
  };

  const resetFilters = () => {
    setFilters({
      mine: false,
      statuses: [],
    });
  };

  const incompleteFilteredCourses = selectedIncompleteItem?.assignmentId
    ? allCourses.filter(
        (course) =>
          !course.isDraft && course.id === selectedIncompleteItem.assignmentId,
      )
    : allCourses;

  const filteredCourses = incompleteFilteredCourses
    .filter((c) => {
      const searchValue = search.trim().toLowerCase();

      if (!searchValue) return true;

      return (
        (c.name || "").toLowerCase().includes(searchValue) ||
        (c.customer || "").toLowerCase().includes(searchValue)
      );
    })
    .filter((c) => {
      if (filters.mine && managerId && c.managerId != null) {
        return c.managerId === managerId;
      }
      if (filters.mine && managerId && c.managerId == null) {
        return true;
      }
      return true;
    })
    .filter((c) => {
      if (filters.statuses.length > 0) {
        return filters.statuses.includes(c.status);
      }
      return true;
    });

  function handleCloseCourseModal() {
    setIsCourseModalOpen(false);
    setSelectedCourse(null);
  }

  if (loading || isLoadingActor) {
    return <p>Laddar kurser...</p>;
  }

  return (
    <div className="course-registry">
      <div className="course-registry__header">
        <h1>Kurser</h1>
      </div>

      <div className="course-registry__toolbar">
        <button
          className="course-registry__filter-toggle"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          Filtrera
        </button>

        <input
          className="course-registry__search"
          type="text"
          placeholder="Sök kurs eller kund..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showFilters && (
        <div className="course-registry__filters">
          <span onClick={toggleMine} className={filters.mine ? "active" : ""}>
            Mina
          </span>

          <span
            onClick={resetFilters}
            className={
              !filters.mine && filters.statuses.length === 0 ? "active" : ""
            }
          >
            Alla
          </span>

          <button
            type="button"
            onClick={() => toggleMultiFilter("statuses", "draft")}
            className={filters.statuses.includes("draft") ? "active" : ""}
          >
            Utkast
          </button>

          <button
            type="button"
            onClick={() => toggleMultiFilter("statuses", "upcoming")}
            className={filters.statuses.includes("upcoming") ? "active" : ""}
          >
            Kommande
          </button>

          <button
            type="button"
            onClick={() => toggleMultiFilter("statuses", "ongoing")}
            className={filters.statuses.includes("ongoing") ? "active" : ""}
          >
            Pågående
          </button>

          <button
            type="button"
            onClick={() => toggleMultiFilter("statuses", "completed")}
            className={filters.statuses.includes("completed") ? "active" : ""}
          >
            Avslutade
          </button>
        </div>
      )}

      <div className="course-registry__active-filters">
        {filters.mine && (
          <span className="chip" onClick={toggleMine}>
            Mina ✕
          </span>
        )}

        {filters.statuses.map((status) => (
          <span
            key={status}
            className="chip"
            onClick={() => toggleMultiFilter("statuses", status)}
          >
            {getStatusLabel(status)} ✕
          </span>
        ))}
      </div>

      <div className="course-registry__list-container">
        <ul className="course-registry__list">
          {filteredCourses.length === 0 ? (
            <li className="course-registry__empty">
              Inga kurser matchar din sökning eller filter.
            </li>
          ) : (
            filteredCourses.map((c) => (
              <li
                key={c.id}
                className="course-registry__item"
                onClick={() => {
                  setSelectedCourse(c);
                  setIsCourseModalOpen(true);
                }}
              >
                <div className="course-item__top">
                  <span className="course-item__name">{c.name}</span>
                  <span
                    className={`course-item__status course-item__status--${c.status}`}
                  >
                    {getStatusLabel(c.status)}
                  </span>
                </div>

                <div className="course-item__meta">
                  <span>
                    {c.startDate} → {c.endDate}
                  </span>
                  <span>{c.customer}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <CourseDetailsModal
        isOpen={isCourseModalOpen}
        course={selectedCourse}
        onClose={handleCloseCourseModal}
        onFindConsultant={(course) => {
          handleCloseCourseModal();
          onOpenConsultantMatching?.(course);
        }}
      />
    </div>
  );
}
