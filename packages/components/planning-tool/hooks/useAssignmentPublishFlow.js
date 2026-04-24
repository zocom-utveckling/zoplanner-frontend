import { useState } from "react";
import { dev } from "@zoplanner/admin";
import {
  assignmentService,
  courseService,
  sessionService,
} from "@zoplanner/api";
import {
  removePlanningDraft,
  toAssignmentPayload,
} from "@zoplanner/planning-tool";

export function useAssignmentPublishFlow({
  managerId,
  courseDraft,
  setActiveAssignment,
  setPlannerMode,
}) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleAssignConsultant(assignment, consultant) {
    if (!assignment?.id || !consultant?.id) return;

    try {
      console.log("ASSIGN PAYLOAD:", {
        assignmentId: assignment.id,
        consultantId: consultant.id,
        managerId: assignment.managerId ?? managerId ?? null,
        dateStart: assignment.dateStart,
        dateEnd: assignment.dateEnd,
      });

      const updatedAssignment = await assignmentService.update(assignment.id, {
        consultantId: consultant.id,
        managerId: assignment.managerId ?? managerId ?? null,
        dateStart: assignment.dateStart,
        dateEnd: assignment.dateEnd,
      });

      setActiveAssignment((previous) => ({
        ...previous,
        ...updatedAssignment,
        consultantId: consultant.id,
        consultant,
        course: previous?.course ?? updatedAssignment?.course,
        sessions: previous?.sessions ?? updatedAssignment?.sessions ?? [],
      }));

      alert(
        `${consultant.name} har tilldelats uppdraget och kursschemat har sparats.`,
      );
    } catch (error) {
      console.error("Failed to assign consultant:", error);
      console.error("ERROR RESPONSE:", error?.response);
      console.error("ERROR DATA:", error?.response?.data);
      alert("Kunde inte tilldela konsult till uppdraget.");
    }
  }

  async function handlePublishDraft() {
    if (!courseDraft) return;

    if (!managerId) {
      alert("Kunde inte identifiera användaren. Försök igen.");
      return;
    }

    setIsSaving(true);

    try {
      let resolvedCourseId = courseDraft.courseId ?? null;

      if (!resolvedCourseId) {
        const resolvedClassId = courseDraft.classId ?? null;

        if (!resolvedClassId) {
          alert("Kunde inte hitta klass för planeringen. Öppna 'Visa upplägg' igen.");
          return;
        }

        try {
          const createdCourse = await courseService.create({
            classId: resolvedClassId,
            name: courseDraft.courseName,
            dateStart: courseDraft.startDate,
            dateEnd: courseDraft.endDate,
          });

          resolvedCourseId = createdCourse?.id ?? createdCourse?.data?.id ?? null;

          if (!resolvedCourseId) {
            console.error("❌ Course created without id:", createdCourse);
            alert("Kunde inte skapa kurs.");
            return;
          }

          console.log("✅ Course created:", createdCourse);
        } catch (error) {
          console.error("❌ Failed to create course:", error);
          alert("Kunde inte skapa kurs.");
          return;
        }
      }

      const assignmentPayload = toAssignmentPayload(
        {
          ...courseDraft,
          courseId: resolvedCourseId,
        },
        managerId,
      );

      const existingAssignmentId =
        courseDraft.assignmentId ??
        (Number.isFinite(Number(courseDraft.id))
          ? Number(courseDraft.id)
          : null);

      let savedAssignment;

      if (existingAssignmentId) {
        try {
          savedAssignment = await assignmentService.update(
            existingAssignmentId,
            assignmentPayload,
          );
          console.log("✅ Assignment updated:", savedAssignment);
        } catch (error) {
          console.error(
            "❌ Failed to update assignment:",
            error,
            assignmentPayload,
          );
          alert("Kunde inte uppdatera kursschema.");
          return;
        }
      } else {
        try {
          savedAssignment = await assignmentService.create(assignmentPayload);
          console.log("✅ Assignment created:", savedAssignment);
        } catch (error) {
          console.error(
            "❌ Failed to create assignment:",
            error,
            assignmentPayload,
          );
          alert("Kunde inte spara kursschema.");
          return;
        }
      }

      if (!savedAssignment?.id) {
        console.error("❌ Assignment saved without id:", savedAssignment);
        alert("Kunde inte spara kursschema.");
        return;
      }

      try {
        dev.saveCourseNameForAssignment(savedAssignment.id, courseDraft.courseName);
      } catch (error) {
        console.error("❌ DEV mapping failed:", error);
      }

      try {
        const assignmentId = savedAssignment.id;
        const draftSessions = courseDraft.sessionsDraft ?? [];
        const existingIds = courseDraft.existingSessionIds ?? [];

        const existingSessions = draftSessions.filter(
          (session) => typeof session.id === "number",
        );

        const newSessions = draftSessions.filter(
          (session) => typeof session.id !== "number",
        );

        for (const session of existingSessions) {
          await sessionService.update(session.id, {
            timeStart: session.timeStart,
            timeEnd: session.timeEnd,
            location: session.location,
            comment: session.title,
          });
        }

        for (const session of newSessions) {
          await sessionService.create(assignmentId, {
            timeStart: session.timeStart,
            timeEnd: session.timeEnd,
            location: session.location,
            comment: session.title,
          });
        }

        const currentIds = existingSessions.map((session) => session.id);

        const deletedIds = existingIds.filter((id) => !currentIds.includes(id));

        for (const id of deletedIds) {
          await sessionService.remove(id);
        }

        console.log("✅ Sessions synced");
      } catch (error) {
        console.error("❌ Failed to sync sessions:", error);
        alert(
          "Kursschema sparades, men vissa lektionstillfällen kunde inte sparas.",
        );
        return;
      }

      const nextAssignment = {
        ...savedAssignment,
        dateStart: courseDraft.startDate,
        dateEnd: courseDraft.endDate,
        course: {
          id: resolvedCourseId,
          name: courseDraft.courseName || "Kursschema",
        },
        sessions: courseDraft.sessionsDraft ?? [],
      };

      setActiveAssignment(nextAssignment);

      setPlannerMode("matching");
      removePlanningDraft(courseDraft.id);

      return nextAssignment;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    isSaving,
    handleAssignConsultant,
    handlePublishDraft,
  };
}