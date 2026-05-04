// Hämtar och formatterar kalender-events från backend.
//
// Tre exporter:
// - fetchSchedulerEvents(user, options) — events för en användare
//   (aktiviteter + sessioner + obokade uppdrag, beroende på options).
// - fetchUserCities() — uniklista över städer från alla användare.
// - fetchConsultantUsers() — uniklista över konsult-namn.
//
// Fält-normalisering bor i ./fieldNormalizers.js, datum-/tidshjälpare i
// ../utils/dateTimeUtils.js.

import {
  activityService,
  assignmentService,
  consultantService,
  courseService,
  userService,
} from "@zoplanner/api";
import {
  toActivityDateTime,
  toDateWithTime,
  toLocalDateTime,
} from "../utils/dateTimeUtils";
import {
  firstNonEmptyString,
  firstNonNull,
  getAssignmentConsultantId,
  getAssignmentConsultantName,
  hasConsultantRole,
  normalizeLocationType,
  resolveAssignmentId,
  resolveSessionId,
  toArray,
  toDisplayCity,
} from "./fieldNormalizers";

export async function fetchUserCities() {
  try {
    const users = toArray(await userService.getAll());

    const cityMap = new Map();

    users.forEach((user) => {
      const city = toDisplayCity(firstNonEmptyString(user?.city, user?.City));
      if (!city) return;
      cityMap.set(city.toLocaleLowerCase("sv"), city);
    });

    return Array.from(cityMap.values()).sort((a, b) =>
      a.localeCompare(b, "sv", { sensitivity: "base" }),
    );
  } catch {
    return [];
  }
}

export async function fetchConsultantUsers() {
  try {
    const [consultantsRes, usersRes] = await Promise.all([
      consultantService.getAll(),
      userService.getAll(),
    ]);

    const consultants = toArray(consultantsRes);
    const users = toArray(usersRes);

    const userMap = new Map(
      users
        .map((user) => [
          user?.id,
          firstNonEmptyString(
            user?.name,
            user?.Name,
            user?.fullName,
            user?.FullName,
            [user?.firstName, user?.lastName].filter(Boolean).join(" "),
            [user?.FirstName, user?.LastName].filter(Boolean).join(" "),
            user?.username,
            user?.Username,
          ),
        ])
        .filter(([id, name]) => Boolean(id) && Boolean(name)),
    );

    const consultantNamesFromConsultants = consultants
      .map((consultant) => {
        const linkedUserName = userMap.get(consultant?.userId);
        return firstNonEmptyString(
          linkedUserName,
          consultant?.name,
          consultant?.Name,
          consultant?.fullName,
          consultant?.FullName,
          [consultant?.firstName, consultant?.lastName]
            .filter(Boolean)
            .join(" "),
          [consultant?.FirstName, consultant?.LastName]
            .filter(Boolean)
            .join(" "),
        );
      })
      .filter(Boolean);

    const consultantNamesFromUsers = users
      .filter((user) => hasConsultantRole(user))
      .map((user) =>
        firstNonEmptyString(
          user?.name,
          user?.Name,
          user?.fullName,
          user?.FullName,
          [user?.firstName, user?.lastName].filter(Boolean).join(" "),
          [user?.FirstName, user?.LastName].filter(Boolean).join(" "),
          user?.username,
          user?.Username,
        ),
      )
      .filter(Boolean);

    const consultantNames = [
      ...consultantNamesFromConsultants,
      ...consultantNamesFromUsers,
    ];

    return Array.from(new Set(consultantNames)).sort((a, b) =>
      a.localeCompare(b, "sv"),
    );
  } catch {
    return [];
  }
}

export async function fetchSchedulerEvents(user, options = {}) {
  if (!user?.id) {
    return [];
  }

  let assignments = [];

  if (options?.includeAllConsultants) {
    assignments = toArray(await assignmentService.getAll());
  } else {
    let consultantId = user?.consultantId || user?.consultant?.id;

    if (!consultantId) {
      const consultants = toArray(await consultantService.getAll());
      const match = consultants.find(
        (consultant) => consultant?.userId === user?.id,
      );
      consultantId = match?.id;
    }

    if (consultantId) {
      assignments = toArray(
        await assignmentService.getByConsultantId(consultantId),
      );
    }
  }

  const [consultantsRes, usersRes] = await Promise.all([
    consultantService.getAll(),
    userService.getAll(),
  ]);

  const consultants = toArray(consultantsRes);
  const users = toArray(usersRes);

  const userNameById = new Map(
    users
      .map((loadedUser) => [
        loadedUser?.id,
        firstNonEmptyString(
          loadedUser?.name,
          loadedUser?.Name,
          loadedUser?.fullName,
          loadedUser?.FullName,
          [loadedUser?.firstName, loadedUser?.lastName]
            .filter(Boolean)
            .join(" "),
          [loadedUser?.FirstName, loadedUser?.LastName]
            .filter(Boolean)
            .join(" "),
          loadedUser?.username,
          loadedUser?.Username,
        ),
      ])
      .filter(([id, name]) => Boolean(id) && Boolean(name)),
  );

  const consultantNameById = new Map(
    consultants
      .map((consultant) => {
        const linkedUserName = userNameById.get(consultant?.userId);
        return [
          consultant?.id,
          firstNonEmptyString(
            linkedUserName,
            consultant?.name,
            consultant?.Name,
            consultant?.fullName,
            consultant?.FullName,
            [consultant?.firstName, consultant?.lastName]
              .filter(Boolean)
              .join(" "),
            [consultant?.FirstName, consultant?.LastName]
              .filter(Boolean)
              .join(" "),
          ),
        ];
      })
      .filter(([id, name]) => Boolean(id) && Boolean(name)),
  );

  const courses = toArray(await courseService.getAll());
  const activities = options?.includeAllConsultants
    ? []
    : toArray(await activityService.getAll());
  const courseMap = new Map(
    courses
      .map((course) => [
        course?.id,
        firstNonEmptyString(
          course?.name,
          course?.Name,
          course?.courseName,
          course?.title,
        ),
      ])
      .filter(([id, name]) => Boolean(id) && Boolean(name)),
  );

  const nextEvents = [];

  activities
    .filter((activity) => String(activity?.userId) === String(user?.id))
    .forEach((activity) => {
      const start = toActivityDateTime(activity?.date, activity?.startTime);
      const end = toActivityDateTime(activity?.date, activity?.endTime);
      if (!start || !end || end <= start) return;

      const baseTitle = firstNonEmptyString(activity?.title) || "Aktivitet";
      const cleanTitle = baseTitle.replace(/^Godkänd: |^Avböjd: /, "");
      const isRequest =
        typeof baseTitle === "string" && cleanTitle === "Förfrågan om ändring";

      nextEvents.push({
        id: activity?.id,
        title: firstNonEmptyString(activity?.title) || "Aktivitet",
        subtitle: firstNonEmptyString(activity?.description) || "",
        description: firstNonEmptyString(activity?.description) || "",
        start,
        end,
        type: firstNonEmptyString(activity?.type) || "meeting",
        source: "activity",
        isRequest,
        context: {
          consultant: firstNonEmptyString(
            userNameById.get(activity?.userId),
            user?.name,
            user?.username,
          ),
        },
      });
    });

  assignments.forEach((assignment) => {
    const consultantName = getAssignmentConsultantName(
      assignment,
      consultantNameById,
    );
    const resolvedAssignmentId = resolveAssignmentId(assignment);

    const assignmentCourseId =
      assignment?.course?.id || assignment?.courseId || assignment?.idCourse;
    const courseName =
      (assignmentCourseId ? courseMap.get(assignmentCourseId) : null) ||
      "Uppdrag";
    const sessions = assignment?.sessions || [];

    if (Array.isArray(sessions) && sessions.length > 0) {
      sessions.forEach((session) => {
        const resolvedSessionId = resolveSessionId(session);
        const start = toLocalDateTime(
          session?.timeStart || session?.start || session?.time_start,
        );
        const end = toLocalDateTime(
          session?.timeEnd || session?.end || session?.time_end,
        );

        if (!start || !end) return;

        const sessionLocation = normalizeLocationType(
          firstNonEmptyString(
            session?.locationType,
            session?.location,
            session?.LocationType,
            session?.Location,
          ),
        );
        const sessionDescription = firstNonEmptyString(
          session?.comment,
          session?.Comment,
          session?.sessionComment,
          session?.description,
          session?.Description,
        );
        const sessionLocationLabel = firstNonEmptyString(
          session?.location,
          session?.Location,
          session?.locationType,
          session?.LocationType,
        );
        const city = firstNonEmptyString(
          assignment?.customer?.city,
          assignment?.customer?.City,
          assignment?.customerCity,
          session?.city,
          session?.City,
          session?.locationCity,
          session?.LocationCity,
          assignment?.city,
          assignment?.City,
        );

        nextEvents.push({
          id: `session-${resolvedAssignmentId ?? "unknown"}-${resolvedSessionId ?? "unknown"}`,
          assignmentId: resolvedAssignmentId,
          sessionId: resolvedSessionId,
          title: courseName,
          subtitle: sessionDescription,
          description: sessionDescription,
          start,
          end,
          type: "session",
          locationType: sessionLocation,
          location: sessionLocationLabel,
          city,
          context: {
            course: courseName,
            className: firstNonEmptyString(
              assignment?.className,
              assignment?.class?.name,
              assignment?.class?.Name,
              assignment?.schoolClass?.name,
              assignment?.schoolClassName,
            ),
            customer: firstNonEmptyString(
              assignment?.customer?.name,
              assignment?.customer?.Name,
              assignment?.customerName,
              assignment?.client?.name,
              assignment?.companyName,
            ),
            consultant: firstNonEmptyString(consultantName),
            location: sessionLocationLabel,
            city,
            customerCity: city,
            availability: sessionLocation,
          },
        });
      });
    }

    if (options?.onlyBookedPasses || sessions.length > 0) {
      return;
    }

    const start =
      toDateWithTime(assignment?.course?.dateStart, 8, 0) ||
      toDateWithTime(assignment?.dateStart, 8, 0) ||
      toDateWithTime(assignment?.startDate, 8, 0);
    const end =
      toDateWithTime(assignment?.course?.dateEnd, 17, 0) ||
      toDateWithTime(assignment?.dateEnd, 17, 0) ||
      toDateWithTime(assignment?.dateStart, 17, 0);

    if (!start || !end) return;

    nextEvents.push({
      id: `assignment-${resolvedAssignmentId ?? "unknown"}`,
      assignmentId: resolvedAssignmentId,
      consultantId: getAssignmentConsultantId(assignment),
      managerId: firstNonNull(
        assignment?.managerId,
        assignment?.idManager,
        assignment?.manager?.id,
      ),
      courseId: assignmentCourseId ?? null,
      title: courseName,
      start,
      end,
      type: "assignment",
      description: firstNonEmptyString(
        assignment?.description,
        assignment?.Description,
        assignment?.comment,
      ),
      locationType: normalizeLocationType(
        firstNonEmptyString(
          assignment?.locationType,
          assignment?.location,
          assignment?.LocationType,
          assignment?.Location,
        ),
      ),
      location: firstNonEmptyString(
        assignment?.location,
        assignment?.Location,
        assignment?.locationType,
        assignment?.LocationType,
      ),
      city: firstNonEmptyString(
        assignment?.customer?.city,
        assignment?.customer?.City,
        assignment?.customerCity,
        assignment?.city,
        assignment?.City,
        assignment?.locationCity,
        assignment?.LocationCity,
      ),
      context: {
        course: courseName,
        className: firstNonEmptyString(
          assignment?.className,
          assignment?.class?.name,
          assignment?.class?.Name,
          assignment?.schoolClass?.name,
          assignment?.schoolClassName,
        ),
        customer: firstNonEmptyString(
          assignment?.customer?.name,
          assignment?.customer?.Name,
          assignment?.customerName,
          assignment?.client?.name,
          assignment?.companyName,
        ),
        consultant: firstNonEmptyString(consultantName),
        location: firstNonEmptyString(
          assignment?.location,
          assignment?.Location,
          assignment?.locationType,
          assignment?.LocationType,
        ),
        city: firstNonEmptyString(
          assignment?.customer?.city,
          assignment?.customer?.City,
          assignment?.customerCity,
          assignment?.city,
          assignment?.City,
          assignment?.locationCity,
          assignment?.LocationCity,
        ),
        customerCity: firstNonEmptyString(
          assignment?.customer?.city,
          assignment?.customer?.City,
          assignment?.customerCity,
        ),
        availability: normalizeLocationType(
          firstNonEmptyString(
            assignment?.locationType,
            assignment?.location,
            assignment?.LocationType,
            assignment?.Location,
          ),
        ),
      },
    });
  });

  return nextEvents;
}
