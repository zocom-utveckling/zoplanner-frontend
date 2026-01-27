import React, { useState } from "react";
import "./index.css";
import { UserProfile } from "@zoplanner/user-profile";
import { AddActivityModal } from "@zoplanner/add-activity-modal";

function Sidebar({ user }) {
  console.log(user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddActivity = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitActivity = (activityData) => {
    console.log("Ny aktivitet:", activityData);
    // TODO: Integrate with backend API to save activity
  };

  return (
    <aside className="sidebar">
      <UserProfile user={user} />

      <button className="add-activity-btn" onClick={handleAddActivity}>
        <span className="plus-icon">+</span> Lägg till aktivitet
      </button>

      <AddActivityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitActivity}
      />
    </aside>
  );
}

export { Sidebar };
