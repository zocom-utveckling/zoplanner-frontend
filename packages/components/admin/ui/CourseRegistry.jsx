import "./index.css";
import { useEffect, useState } from "react";
import { useCurrentActor } from "@zoplanner/app-hooks";
import { assignmentService } from "@zoplanner/api";
import { dev } from "@zoplanner/admin";
import CourseDetailsModal from "./CourseDetailsModal";
import ConfirmModal from "./ConfirmModal";
import {
  loadPlanningDrafts,
  removePlanningDraft,
} from "@zoplanner/planning-tool";
import { RegistrySearchFilter } from "./RegistrySearchFilter";

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
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(null);
  const [draftsKey, setDraftsKey] = useState(0);

  // draftsKey dependency ensures re-read from localStorage after deletion
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const drafts = loadPlanningDrafts();

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    mine: false,
    statuses: [],
    subjects: [],
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

    const withinDateRange = today >= start && today <= end;
    const hasConsultant = Boolean(courseLike.consultantId);
    const hasSessions = (courseLike.sessions?.length ?? 0) > 0;

    if (withinDateRange && hasConsultant && hasSessions) return "ongoing";
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
    subject:
      assignment.course?.subject ||
      assignment.course?.subjectArea ||
      assignment.course?.courseSubject ||
      assignment.subject ||
      assignment.Subject ||
      "",
    hasConsultant: Boolean(assignment.consultantId),
    status: getStatus({
      startDate: assignment.dateStart,
      endDate: assignment.dateEnd,
      consultantId: assignment.consultantId,
      sessions: assignment.sessions,
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
    subject: draft.subject || draft.subjectArea || draft.courseSubject || "",
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

  const resetFilters = () => {
    setFilters({
      mine: false,
      statuses: [],
      subjects: [],
    });
  };

  const subjectOptions = [
    ...new Set(
      allCourses
        .map((course) => (course.subject || "").trim())
        .filter((subject) => subject.length > 0),
    ),
  ].sort((a, b) => a.localeCompare(b, "sv"));

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
    })
    .filter((c) => {
      if (filters.subjects.length > 0) {
        return filters.subjects.includes((c.subject || "").trim());
      }
      return true;
    });

  function handleCloseCourseModal() {
    setIsCourseModalOpen(false);
    setSelectedCourse(null);
  }

  function handleOpenDeleteConfirm(course) {
    setConfirmDeleteCourse(course);
  }

  function handleCloseDeleteConfirm() {
    setConfirmDeleteCourse(null);
  }

  async function handleDeleteCourse(course) {
    try {
      if (course.isDraft) {
        removePlanningDraft(course.draftId);
        setDraftsKey((k) => k + 1);
      } else {
        await assignmentService.remove(course.id);
        setAssignments((prev) => prev.filter((a) => a.id !== course.id));
      }
      handleCloseDeleteConfirm();
      handleCloseCourseModal();
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Kunde inte radera kursen. Försök igen.");
    }
  }

  if (loading || isLoadingActor) {
    return <p>Laddar kurser...</p>;
  }

  return (
    <div className="course-registry">
      <div className="course-registry__header">
        <h1>Kurser</h1>
      </div>
      <div className="course-registry__main">
        <RegistrySearchFilter
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Sök kurs eller kund..."
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          filters={[
            { key: "mine", label: "Mina", type: "toggle" },
            {
              key: "statuses",
              label: "Status",
              type: "multi",
              options: [
                { value: "draft", label: "Utkast" },
                { value: "upcoming", label: "Kommande" },
                { value: "ongoing", label: "Pågående" },
                { value: "completed", label: "Avslutade" },
              ],
            },
            {
              key: "subjects",
              label: "Ämnesområde",
              type: "multi",
              demoNote:
                "Demo: Ämnesområde-filter saknar backendstöd ännu och baseras på tillgänglig frontenddata.",
              options: subjectOptions.map((subject) => ({
                value: subject,
                label: subject,
              })),
            },
          ]}
          filterState={filters}
          onToggleFilter={(key) =>
            setFilters((prev) => ({
              ...prev,
              [key]: !prev[key],
            }))
          }
          onMultiFilterToggle={toggleMultiFilter}
          onResetFilters={resetFilters}
        />

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
                    {!c.isDraft && (
                      <span
                        className={`course-item__consultant-badge course-item__consultant-badge--${c.hasConsultant ? "assigned" : "unassigned"}`}
                      >
                        {c.hasConsultant
                          ? "Konsult tilldelad"
                          : "Ingen konsult"}
                      </span>
                    )}
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
          onDelete={handleOpenDeleteConfirm}
          onFindConsultant={(course) => {
            handleCloseCourseModal();

            const assignmentForMatching = course.assignment
              ? {
                  ...course.assignment,
                  sessions: course.sessions ?? course.assignment.sessions ?? [],
                  consultantId: course.assignment.consultantId ?? null,
                  consultant: course.assignment.consultant ?? null,
                }
              : course;
            onOpenConsultantMatching?.(assignmentForMatching);
          }}
        />

        <ConfirmModal
          isOpen={Boolean(confirmDeleteCourse)}
          title="Radera kurs"
          message={`Är du säker på att du vill radera "${confirmDeleteCourse?.name}"? Åtgärden kan inte ångras.`}
          onCancel={handleCloseDeleteConfirm}
          onConfirm={() =>
            confirmDeleteCourse && handleDeleteCourse(confirmDeleteCourse)
          }
        />
      </div>
    </div>
  );
}
