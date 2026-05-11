import { activityService } from "@zoplanner/api";
import { toLocalDateTime } from "@zoplanner/calendar";
import { useActivityForm } from "@zoplanner/activity-creation";

function useProfileActivityModal(setActivities) {
  async function updateActivity(updatedEvent) {
    const response = await activityService.update(
      updatedEvent.id,
      updatedEvent,
    );
    const updated = response?.data || response;

    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === updatedEvent.id
          ? { ...activity, ...updated }
          : activity,
      ),
    );
  }

  async function deleteActivity(activityId) {
    await activityService.remove(activityId);
    setActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId),
    );
  }

  const {
    isActivityModalOpen,
    activityFormData,
    activityModalMode,
    handleOpenActivityModalForEvent,
    handleCloseActivityModal,
    handleStartEditingActivity,
    handleDeleteActivity,
    handleActivityChange,
    handleActivitySubmit,
  } = useActivityForm({
    onDateSelected: () => {},
    onCreateEvent: () => {},
    onUpdateEvent: updateActivity,
    onDeleteEvent: deleteActivity,
  });

  function handleOpenActivityEdit(activity) {
    const start = toLocalDateTime(`${activity.date} ${activity.startTime}:00`);
    const end = toLocalDateTime(`${activity.date} ${activity.endTime}:00`);

    handleOpenActivityModalForEvent({ ...activity, start, end });
  }

  return {
    isActivityModalOpen,
    activityFormData,
    activityModalMode,
    handleCloseActivityModal,
    handleStartEditingActivity,
    handleDeleteActivity,
    handleActivityChange,
    handleActivitySubmit,
    handleOpenActivityEdit,
  };
}

export { useProfileActivityModal };
