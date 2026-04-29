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
  setCourseDraft,
  setPlannerMode,
}) {
  const [isSaving, setIsSaving] = useState(false);

  function resolveEntityId(entity) {
  return entity?.id ?? entity?.assignmentId ?? entity?.data?.id ?? null;
}

async function handleAssignConsultant(assignment, consultant) {
  const resolvedAssignmentId = resolveEntityId(assignment);

  console.log("🔥 ASSIGN USING ID:", resolvedAssignmentId);

    if (!resolvedAssignmentId || !consultant?.id) {
      console.error("Cannot assign consultant without persisted assignment id", {
        assignment,
        consultant,
      });
      return;
    }

    try {
      console.log("ASSIGN PAYLOAD:", {
        assignmentId: resolvedAssignmentId,
        consultantId: consultant.id,
        managerId: assignment.managerId ?? managerId ?? null,
        dateStart: assignment.dateStart,
        dateEnd: assignment.dateEnd,
      });

      const updatedAssignmentResponse = await assignmentService.update(
        resolvedAssignmentId,
        {
          consultantId: consultant.id,
          managerId: assignment.managerId ?? managerId ?? null,
          dateStart: assignment.dateStart,
          dateEnd: assignment.dateEnd,
        },
      );

      // Some backend update endpoints return 204/empty body.
      const updatedAssignment =
        updatedAssignmentResponse && Object.keys(updatedAssignmentResponse).length > 0
          ? updatedAssignmentResponse
          : { id: resolvedAssignmentId };

      setActiveAssignment((previous) => ({
        ...previous,
        ...updatedAssignment,
        id: resolvedAssignmentId,
        assignmentId: resolvedAssignmentId,
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
  console.log("🔥 PUBLISH START", courseDraft);

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
          const updateResponse = await assignmentService.update(
            existingAssignmentId,
            assignmentPayload,
          );

          // Some update endpoints return 204/empty response.
          savedAssignment =
            updateResponse && Object.keys(updateResponse).length > 0
              ? updateResponse
              : { id: existingAssignmentId };

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

      const resolvedAssignmentId = resolveEntityId(savedAssignment) ?? existingAssignmentId;

      if (!resolvedAssignmentId) {
        console.error("❌ Assignment saved without id:", savedAssignment);
        alert("Kunde inte spara kursschema.");
        return;
      }

      try {
        dev.saveCourseNameForAssignment(resolvedAssignmentId, courseDraft.courseName);
      } catch (error) {
        console.error("❌ DEV mapping failed:", error);
      }

      try {
        const assignmentId = resolvedAssignmentId;
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
        id: resolvedAssignmentId,
        assignmentId: resolvedAssignmentId,
        dateStart: courseDraft.startDate,
        dateEnd: courseDraft.endDate,
        course: {
          id: resolvedCourseId,
          name: courseDraft.courseName || "Kursschema",
        },
        sessions: courseDraft.sessionsDraft ?? [],
      };

      setActiveAssignment(nextAssignment);

      setCourseDraft((previousDraft) => {
        if (!previousDraft) return previousDraft;

        return {
          ...previousDraft,
          id: resolvedAssignmentId,
          assignmentId: resolvedAssignmentId,
          courseId: resolvedCourseId,
          existingSessionIds: (previousDraft.sessionsDraft ?? [])
            .map((session) => session?.id)
            .filter((sessionId) => typeof sessionId === "number"),
        };
      });

      setPlannerMode("matching");
// removePlanningDraft(courseDraft.id);

console.log("🔥 RETURNING ASSIGNMENT", nextAssignment);

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