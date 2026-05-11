import { useRef } from "react";
import { activityService } from "@zoplanner/api";
import { toDatePart, toTimePart } from "../utils/dateTimeUtils";
import { emitActivitiesUpdated } from "../utils/activityEvents";
import { stripLabelSuffix } from "../utils/bookingMeta";

// Synkar aktiviteter mellan två kalendrar (manager ↔ medarbetare) på Dashboard.
// När en manager redigerar någon annans kalender skapar vi samma aktivitet på
// båda användarna med olika titel-suffix (" - {namn}") så båda ser den i sin
// vy. Vi håller koll på id-paren via en intern ref-map och fallar tillbaka
// till en sökning på titel/datum/tid om mappen är tom (ex. efter sidladdning).
//
// Anropare skickar in CRUD från useSchedulerEvents (en för calendarUser och en
// för managerUser) och får tillbaka tre handlers att stoppa in i useActivityForm.
export default function useCrossCalendarSync({
  user,
  calendarUser,
  managerUser,
  // CRUD för "huvudkalendern" (calendarUser eller user om ingen calendarUser)
  addEvent,
  updateEvent,
  removeEvent,
  // CRUD för manager-kalendern (används bara när manager redigerar någon annan)
  managerAddEvent,
  managerUpdateEvent,
  managerRemoveEvent,
}) {
  const isManagerManagingOther = Boolean(
    managerUser && calendarUser && managerUser.id !== calendarUser.id,
  );

  const managerName = managerUser?.name || managerUser?.username || "Manager";
  const calendarUserName =
    calendarUser?.name || calendarUser?.username || "Medarbetare";

  // Map: { [eventId]: { linkedId, linkedUserId, selfLabel, linkedLabel } }
  const crossCalendarMapRef = useRef({});

  function toActivityPayload(eventItem, userId) {
    return {
      title: eventItem?.title || "Aktivitet",
      type: eventItem?.type || "meeting",
      date: toDatePart(eventItem?.start),
      startTime: toTimePart(eventItem?.start),
      endTime: toTimePart(eventItem?.end),
      description: eventItem?.description || eventItem?.subtitle || "",
      ...(userId ? { userId } : {}),
    };
  }

  function getLinkedMeta(eventId) {
    return crossCalendarMapRef.current[String(eventId)] || null;
  }

  function toArray(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  // N\u00e4r crossCalendarMapRef saknar koppling (ex. direkt efter sidladdning)
  // letar vi upp den l\u00e4nkade aktiviteten via API:t p\u00e5 titel/datum/tid.
  async function resolveLinkedMeta(eventId) {
    if (!isManagerManagingOther) return null;

    const currentUserId = calendarUser?.id || user?.id;
    const linkedUserId = managerUser?.id;

    if (!currentUserId || !linkedUserId) return null;

    try {
      const allActivities = toArray(await activityService.getAll());
      const currentActivity = allActivities.find(
        (activity) => String(activity?.id) === String(eventId),
      );

      if (!currentActivity) return null;

      const currentBaseTitle = stripLabelSuffix(currentActivity?.title, [
        managerName,
        calendarUserName,
      ]);

      const linkedActivity = allActivities.find((activity) => {
        if (String(activity?.userId) !== String(linkedUserId)) return false;
        if (String(activity?.id) === String(currentActivity?.id)) return false;

        const linkedBaseTitle = stripLabelSuffix(activity?.title, [
          managerName,
          calendarUserName,
        ]);

        return (
          linkedBaseTitle === currentBaseTitle &&
          activity?.date === currentActivity?.date &&
          activity?.startTime === currentActivity?.startTime &&
          activity?.endTime === currentActivity?.endTime
        );
      });

      if (!linkedActivity?.id) return null;

      return {
        linkedId: String(linkedActivity.id),
        linkedUserId,
      };
    } catch {
      return null;
    }
  }

  async function handleCreateEventForBothUsers(eventData) {
    if (!isManagerManagingOther) {
      addEvent(eventData);
      return;
    }

    const baseTitle = stripLabelSuffix(eventData?.title, [
      managerName,
      calendarUserName,
    ]);
    const calendarEventTitle = `${baseTitle} - ${managerName}`;
    const managerEventTitle = `${baseTitle} - ${calendarUserName}`;

    // Skapa parallellt på båda kalendrar och spara id-kopplingen
    const [calEvent, managerEvent] = await Promise.all([
      addEvent({ ...eventData, title: calendarEventTitle }),
      managerAddEvent({ ...eventData, title: managerEventTitle }),
    ]);

    if (calEvent?.id && managerEvent?.id) {
      crossCalendarMapRef.current[String(calEvent.id)] = {
        linkedId: String(managerEvent.id),
        linkedUserId: managerUser?.id,
        selfLabel: managerName,
        linkedLabel: calendarUserName,
      };
      crossCalendarMapRef.current[String(managerEvent.id)] = {
        linkedId: String(calEvent.id),
        linkedUserId: calendarUser?.id,
        selfLabel: calendarUserName,
        linkedLabel: managerName,
      };
    }
  }

  async function handleUpdateEventForBothUsers(updatedEvent) {
    const linkedMeta = getLinkedMeta(updatedEvent?.id);
    const resolvedLinkedMeta =
      linkedMeta || (await resolveLinkedMeta(updatedEvent?.id));

    if (!resolvedLinkedMeta) {
      updateEvent(updatedEvent);
      return;
    }

    const currentUserId = calendarUser?.id || user?.id;
    const fallbackLabels =
      String(resolvedLinkedMeta.linkedUserId) === String(managerUser?.id)
        ? { selfLabel: managerName, linkedLabel: calendarUserName }
        : { selfLabel: calendarUserName, linkedLabel: managerName };

    const normalizedMeta = {
      ...resolvedLinkedMeta,
      selfLabel: linkedMeta?.selfLabel || fallbackLabels.selfLabel,
      linkedLabel: linkedMeta?.linkedLabel || fallbackLabels.linkedLabel,
    };

    if (!linkedMeta && normalizedMeta?.linkedId && updatedEvent?.id) {
      crossCalendarMapRef.current[String(updatedEvent.id)] = {
        linkedId: String(normalizedMeta.linkedId),
        linkedUserId: normalizedMeta.linkedUserId,
        selfLabel: normalizedMeta.selfLabel,
        linkedLabel: normalizedMeta.linkedLabel,
      };

      if (currentUserId) {
        crossCalendarMapRef.current[String(normalizedMeta.linkedId)] = {
          linkedId: String(updatedEvent.id),
          linkedUserId: currentUserId,
          selfLabel: normalizedMeta.linkedLabel,
          linkedLabel: normalizedMeta.selfLabel,
        };
      }
    }

    const baseTitle = stripLabelSuffix(updatedEvent?.title, [
      normalizedMeta.selfLabel,
      normalizedMeta.linkedLabel,
    ]);
    const normalizedCurrentEvent = {
      ...updatedEvent,
      title: `${baseTitle} - ${normalizedMeta.selfLabel}`,
    };
    const normalizedLinkedEvent = {
      ...updatedEvent,
      id: normalizedMeta.linkedId,
      title: `${baseTitle} - ${normalizedMeta.linkedLabel}`,
    };

    updateEvent(normalizedCurrentEvent);

    if (String(normalizedMeta.linkedUserId) === String(managerUser?.id)) {
      managerUpdateEvent(normalizedLinkedEvent);
      return;
    }

    try {
      await activityService.update(
        Number(normalizedMeta.linkedId),
        toActivityPayload(normalizedLinkedEvent, normalizedMeta.linkedUserId),
      );
      emitActivitiesUpdated(normalizedMeta.linkedUserId);
    } catch {
      // no-op
    }
  }

  async function handleDeleteEventForBothUsers(eventId) {
    const linkedMeta = getLinkedMeta(eventId);
    const resolvedLinkedMeta = linkedMeta || (await resolveLinkedMeta(eventId));

    await removeEvent(eventId);

    if (!resolvedLinkedMeta) return;

    if (String(resolvedLinkedMeta.linkedUserId) === String(managerUser?.id)) {
      await managerRemoveEvent(resolvedLinkedMeta.linkedId);
    } else {
      try {
        await activityService.remove(Number(resolvedLinkedMeta.linkedId));
        emitActivitiesUpdated(resolvedLinkedMeta.linkedUserId);
      } catch {
        // no-op
      }
    }

    delete crossCalendarMapRef.current[String(eventId)];
    delete crossCalendarMapRef.current[String(resolvedLinkedMeta.linkedId)];
  }

  return {
    isManagerManagingOther,
    handleCreateEventForBothUsers,
    handleUpdateEventForBothUsers,
    handleDeleteEventForBothUsers,
  };
}
