function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function normalizeLocationType(locationTypeValue) {
  const normalized = firstNonEmptyString(locationTypeValue)?.toUpperCase();
  if (normalized === "REMOTE") return "REMOTE";
  if (normalized === "ONSITE") return "ONSITE";
  if (normalized === "HYBRID") return "HYBRID";
  return null;
}

function getPersonName(person) {
  return firstNonEmptyString(
    person?.name,
    person?.Name,
    person?.fullName,
    person?.FullName,
    [person?.firstName, person?.lastName].filter(Boolean).join(" "),
    [person?.FirstName, person?.LastName].filter(Boolean).join(" "),
  );
}

function getAssignmentConsultantId(assignment) {
  return (
    assignment?.consultantId ||
    assignment?.idConsultant ||
    assignment?.consultant?.id ||
    null
  );
}

function getAssignmentConsultantName(assignment, consultantNameById) {
  const consultantId = getAssignmentConsultantId(assignment);

  return firstNonEmptyString(
    getPersonName(assignment?.consultant),
    assignment?.consultantName,
    assignment?.consultant?.name,
    assignment?.consultant?.Name,
    consultantId ? consultantNameById.get(consultantId) : null,
  );
}

function hasConsultantRole(user) {
  const roleValue = firstNonEmptyString(user?.role, user?.Role);
  if (!roleValue) return false;

  const normalizedRoles = roleValue
    .toLowerCase()
    .split(/[\s,;|/+-]+/)
    .map((role) => role.trim())
    .filter(Boolean);

  return (
    normalizedRoles.includes("consultant") || normalizedRoles.includes("both")
  );
}

function toDisplayCity(cityValue) {
  const normalized = firstNonEmptyString(cityValue);
  if (!normalized) return null;
  return normalized
    .toLocaleLowerCase("sv")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("sv") + part.slice(1))
    .join(" ");
}

export async function fetchUserCities() {
  try {
    const usersRes = await fetch(`http://localhost:5027/api/User`);
    const users = usersRes.ok ? await usersRes.json() : [];

    const cityMap = new Map();

    (Array.isArray(users) ? users : []).forEach((user) => {
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
      fetch(`http://localhost:5027/api/Consultant`),
      fetch(`http://localhost:5027/api/User`),
    ]);

    const consultants = consultantsRes.ok ? await consultantsRes.json() : [];
    const users = usersRes.ok ? await usersRes.json() : [];

    const userMap = new Map(
      (Array.isArray(users) ? users : [])
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

    const consultantNamesFromConsultants = (
      Array.isArray(consultants) ? consultants : []
    )
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

    const consultantNamesFromUsers = (Array.isArray(users) ? users : [])
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

export function toDateWithTime(dateValue, hours, minutes) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) {
    const baseDate = new Date(dateValue);
    if (Number.isNaN(baseDate.getTime())) return null;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  if (
    typeof dateValue === "object" &&
    dateValue !== null &&
    "year" in dateValue &&
    "month" in dateValue &&
    "day" in dateValue
  ) {
    const baseDate = new Date(
      dateValue.year,
      Math.max(0, dateValue.month - 1),
      dateValue.day,
    );
    if (Number.isNaN(baseDate.getTime())) return null;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  const asString = String(dateValue);
  if (/^\d{4}-\d{2}-\d{2}$/.test(asString)) {
    const [year, month, day] = asString.split("-").map(Number);
    const baseDate = new Date(year, Math.max(0, month - 1), day);
    if (Number.isNaN(baseDate.getTime())) return null;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  const base = asString.includes("T")
    ? new Date(asString)
    : new Date(`${asString}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  base.setHours(hours, minutes, 0, 0);
  return base;
}

export function toLocalDateTime(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : new Date(dateValue);
  }

  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();
    const match = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
    );

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const hour = Number(match[4]);
      const minute = Number(match[5]);
      const second = match[6] ? Number(match[6]) : 0;
      const localDate = new Date(year, month - 1, day, hour, minute, second, 0);
      return Number.isNaN(localDate.getTime()) ? null : localDate;
    }
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function fetchSchedulerEvents(user, options = {}) {
  if (!user?.id) {
    return [];
  }

  let assignments = [];

  if (options?.includeAllConsultants) {
    const assignmentsRes = await fetch(`http://localhost:5027/api/Assignment`);
    assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
  } else {
    let consultantId = user?.consultantId || user?.consultant?.id;

    if (!consultantId) {
      const consultantsRes = await fetch(
        `http://localhost:5027/api/Consultant`,
      );
      const consultants = consultantsRes.ok ? await consultantsRes.json() : [];
      const match = consultants.find(
        (consultant) => consultant?.userId === user?.id,
      );
      consultantId = match?.id;
    }

    if (!consultantId) {
      return [];
    }

    const assignmentsRes = await fetch(
      `http://localhost:5027/api/Assignment/consultant/${consultantId}`,
    );

    assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
  }

  const [consultantsRes, usersRes] = await Promise.all([
    fetch(`http://localhost:5027/api/Consultant`),
    fetch(`http://localhost:5027/api/User`),
  ]);

  const consultants = consultantsRes.ok ? await consultantsRes.json() : [];
  const users = usersRes.ok ? await usersRes.json() : [];

  const userNameById = new Map(
    (Array.isArray(users) ? users : [])
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
    (Array.isArray(consultants) ? consultants : [])
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

  const coursesRes = await fetch(`http://localhost:5027/api/Course`);
  const courses = coursesRes.ok ? await coursesRes.json() : [];
  const courseMap = new Map(
    (Array.isArray(courses) ? courses : [])
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

  assignments.forEach((assignment) => {
    const consultantName = getAssignmentConsultantName(
      assignment,
      consultantNameById,
    );

    const assignmentCourseId =
      assignment?.course?.id || assignment?.courseId || assignment?.idCourse;
    const courseName =
      (assignmentCourseId ? courseMap.get(assignmentCourseId) : null) ||
      "Uppdrag";
    const sessions = assignment?.sessions || [];

    if (Array.isArray(sessions) && sessions.length > 0) {
      sessions.forEach((session) => {
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
          session?.city,
          session?.City,
          session?.locationCity,
          session?.LocationCity,
          assignment?.city,
          assignment?.City,
          assignment?.customer?.city,
          assignment?.customer?.City,
          assignment?.customerCity,
        );

        nextEvents.push({
          id: `session-${assignment.id}-${session.id}`,
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
      id: `assignment-${assignment.id}`,
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
        assignment?.city,
        assignment?.City,
        assignment?.locationCity,
        assignment?.LocationCity,
        assignment?.customer?.city,
        assignment?.customer?.City,
        assignment?.customerCity,
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
          assignment?.city,
          assignment?.City,
          assignment?.locationCity,
          assignment?.LocationCity,
          assignment?.customer?.city,
          assignment?.customer?.City,
          assignment?.customerCity,
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
