import "./index.css";
import "../../../components/calendar/core/index.css";
import { useMemo, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { Navbar } from "@zoplanner/navbar";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCurrentActor,
  useProfilePicture,
  useUserById,
} from "@zoplanner/app-hooks";
import { ActivityModal, EventDetailsModal } from "@zoplanner/calendar";
import { ConfirmPopup } from "../../../components/confirm-popup/ui";
import { ProfileCard } from "@zoplanner/profile-card";
import {
  formatDateRange,
  formatActivityTime,
  normalizeSkills,
} from "../utils/profile.utils";
import { useProfileData } from "../hooks/useProfileData";
import { useProfileEdit } from "../hooks/useProfileEdit";
import { useProfileActivityModal } from "../hooks/useProfileActivityModal";

const COMPETENCY_GROUPS = [
  {
    title: "Frontend",
    options: [
      "CSS",
      "HTML",
      "React",
      "Angular",
      "TypeScript",
      "Vue",
      "Javascript",
    ],
  },
  {
    title: "Verktyg & API",
    options: ["Git", "Docker", "REST API", "GraphQL"],
  },
  {
    title: "Backend",
    options: [".NET", "Java", "Node.js", "Python"],
  },
  {
    title: "Databaser",
    options: ["PostgreSQL", "MySQL", "MongoDB"],
  },
];

function Profile_Page({ user: initialUser }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedAssignmentEvent, setSelectedAssignmentEvent] = useState(null);

  function assignmentToEvent(assignment) {
    const start = assignment?.dateStart
      ? new Date(assignment.dateStart)
      : assignment?.course?.dateStart
        ? new Date(assignment.course.dateStart)
        : null;
    const end = assignment?.dateEnd
      ? new Date(assignment.dateEnd)
      : assignment?.course?.dateEnd
        ? new Date(assignment.course.dateEnd)
        : null;
    return {
      id: assignment?.id,
      title: assignment?.course?.name || assignment?.title || "Uppdrag",
      start,
      end,
      description: assignment?.description || assignment?.comment || null,
      locationType: assignment?.locationType || assignment?.location || null,
      context: {
        className:
          assignment?.className ||
          assignment?.class?.name ||
          assignment?.schoolClass?.name ||
          null,
        customer:
          assignment?.customer?.name || assignment?.customerName || null,
        room: assignment?.room || null,
      },
    };
  }

  const { id } = useParams();
  const navigate = useNavigate();

  const {
    user,
    setUser,
    loading: isLoadingUser,
    error: userError,
  } = useUserById(id, initialUser);

  const userId = user?.id || initialUser?.id || id;
  const { consultantId } = useCurrentActor(user);
  const { isUploadingPicture, handleImageChange } = useProfilePicture(
    userId,
    user?.profilePicture || user?.profilePictureUrl,
  );

  const { assignments, activities, setActivities, isLoadingSidebarData } =
    useProfileData(user, consultantId);

  const {
    isActivityModalOpen,
    activityFormData,
    activityModalMode,
    handleCloseActivityModal,
    handleStartEditingActivity,
    handleDeleteActivity,
    handleActivityChange,
    handleActivitySubmit,
    handleOpenActivityEdit,
  } = useProfileActivityModal(setActivities);

  const {
    isEditing,
    selectedCompetencies,
    isSavingProfile,
    handleToggleCompetency,
    handleStartEdit,
    handleCancelEdit,
    handleSaveProfile,
  } = useProfileEdit(user, initialUser, setUser);

  const aboutSkills = useMemo(() => normalizeSkills(user), [user]);

  const activeSkills = isEditing ? selectedCompetencies : aboutSkills;

  if (isLoadingUser) return <div>Laddar användare...</div>;

  if (userError)
    return (
      <div>
        {userError.message || "Kunde inte ladda användaren. Försök igen."}
      </div>
    );

  if (!user) return <div>Ingen användare hittades.</div>;

  return (
    <>
      {showLogoutConfirm && (
        <ConfirmPopup
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => navigate("/")}
          text={"Logga ut?"}
        />
      )}

      <Navbar user={user} activePage={"profile"} />
      <div className="profile-page-container">
        <main className="profile-content">
          <section className="profile-page-layout">
            <aside className="profile-picture-wrapper">
              <div className="profile-page-card-shell">
                <ProfileCard user={user} />

                <button
                  className="profile-page-camera-btn"
                  type="button"
                  disabled={isUploadingPicture}
                  onClick={() =>
                    document.getElementById("profileFileInput").click()
                  }
                  aria-label="Byt profilbild"
                >
                  <FaCamera size={16} />
                </button>

                <input
                  id="profileFileInput"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </div>
            </aside>

            <div className="profile-main-column">
              <section className="profile-page-panel">
                <h3 className="profile-page-panel-title">Om</h3>

                <div className="profile-page-about-grid">
                  <div className="profile-page-about-row">
                    <span className="profile-page-about-label">Email</span>
                    <span className="profile-page-about-value">
                      {user.email}
                    </span>
                  </div>

                  <div className="profile-page-about-row">
                    <span className="profile-page-about-label">
                      Användarnamn
                    </span>
                    <span className="profile-page-about-value">
                      {user.username}
                    </span>
                  </div>

                  <div className="profile-page-about-row">
                    <span className="profile-page-about-label">Stad</span>
                    <span className="profile-page-about-value">
                      {user.city || "-"}
                    </span>
                  </div>

                  <div className="profile-page-about-row profile-page-about-row--skills">
                    <span className="profile-page-about-label">
                      Kompetenser
                    </span>
                    <div className="profile-page-about-competency-section">
                      {isEditing ? (
                        <div className="profile-page-competency-groups">
                          {COMPETENCY_GROUPS.map((group, index) => (
                            <section
                              key={`${group.title}-${index}`}
                              className="profile-page-competency-group"
                            >
                              <h4 className="profile-page-competency-title">
                                {group.title}
                              </h4>
                              <div className="profile-page-competency-options">
                                {group.options.map((option) => {
                                  const isChecked =
                                    selectedCompetencies.includes(option);
                                  return (
                                    <label
                                      key={option}
                                      className="profile-page-competency-option"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() =>
                                          handleToggleCompetency(option)
                                        }
                                      />
                                      <span>{option}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </section>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="profile-page-skills">
                            {activeSkills.length ? (
                              activeSkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="profile-page-skill-pill"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="profile-page-empty">
                                Saknar kompetenser
                              </span>
                            )}
                          </div>
                          <p className="profile-page-competency-note">
                            Demo: Kompetenser sparas lokalt i webblasaren.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="profile-page-about-actions">
                  {isEditing ? (
                    <>
                      <button
                        className="profile-page-action-btn profile-page-action-btn--ghost"
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSavingProfile}
                      >
                        Avbryt
                      </button>

                      <button
                        className="profile-page-action-btn profile-page-action-btn--primary"
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? "Sparar..." : "Spara"}
                      </button>
                    </>
                  ) : (
                    <button
                      className="profile-page-action-btn profile-page-action-btn--primary"
                      type="button"
                      onClick={handleStartEdit}
                    >
                      Redigera
                    </button>
                  )}
                </div>
              </section>

              <section className="profile-page-panel">
                <h3 className="profile-page-panel-title">Aktiviteter</h3>

                {isLoadingSidebarData ? (
                  <p className="profile-page-empty">Laddar aktiviteter...</p>
                ) : activities.length ? (
                  <div className="profile-page-list">
                    {activities.slice(0, 5).map((activity) => (
                      <article
                        key={
                          activity?.id || `${activity?.title}-${activity?.date}`
                        }
                        className="profile-page-list-item"
                      >
                        <div>
                          <h4 className="profile-page-list-title">
                            {activity?.title || "Aktivitet"}
                          </h4>
                          <p className="profile-page-list-subtitle">
                            {formatActivityTime(activity)}
                          </p>
                          {activity?.description && (
                            <p className="profile-page-list-description">
                              {activity.description}
                            </p>
                          )}
                        </div>

                        <button
                          className="profile-page-list-btn"
                          type="button"
                          onClick={() => handleOpenActivityEdit(activity)}
                        >
                          Ändra
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="profile-page-empty">
                    Inga aktiviteter hittades.
                  </p>
                )}
              </section>
            </div>

            <aside className="profile-side-column">
              <section className="profile-page-panel">
                <h3 className="profile-page-panel-title">Uppdrag</h3>

                {isLoadingSidebarData ? (
                  <p className="profile-page-empty">Laddar uppdrag...</p>
                ) : assignments.length ? (
                  <div className="profile-page-list">
                    {assignments.slice(0, 5).map((assignment) => (
                      <article
                        key={assignment?.id || assignment?.course?.id}
                        className="profile-page-list-item"
                      >
                        <div>
                          <h4 className="profile-page-list-title">
                            {assignment?.course?.name || "Uppdrag"}
                          </h4>
                          <p className="profile-page-list-subtitle">
                            {formatDateRange(
                              assignment?.dateStart ||
                                assignment?.course?.dateStart,
                              assignment?.dateEnd ||
                                assignment?.course?.dateEnd,
                            )}
                          </p>
                        </div>

                        <button
                          className="profile-page-list-btn"
                          type="button"
                          onClick={() =>
                            setSelectedAssignmentEvent(
                              assignmentToEvent(assignment),
                            )
                          }
                        >
                          Mer info
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="profile-page-empty">Inga uppdrag hittades.</p>
                )}
              </section>
            </aside>
          </section>

          <div className="profile-page-footer-actions">
            <button
              className="profile-page-logout-btn"
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Logga ut"
              title="Logga ut"
            >
              <FiLogOut size={22} />
            </button>
          </div>
        </main>
      </div>

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={handleCloseActivityModal}
        formData={activityFormData}
        onChange={handleActivityChange}
        onSubmit={handleActivitySubmit}
        mode={activityModalMode}
        onStartEdit={handleStartEditingActivity}
        onDelete={handleDeleteActivity}
      />

      <EventDetailsModal
        event={selectedAssignmentEvent}
        onClose={() => setSelectedAssignmentEvent(null)}
        userRole={user?.role}
      />
    </>
  );
}

export { Profile_Page };
