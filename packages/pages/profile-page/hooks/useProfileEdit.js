import { useEffect, useState } from "react";
import { userService } from "@zoplanner/api";
import { createEditDraft, normalizeSkills } from "../utils/profile.utils";

function useProfileEdit(user, initialUser, setUser) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(createEditDraft(initialUser));
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEditDraft(createEditDraft(user));
    setSelectedCompetencies(normalizeSkills(user));
  }, [user]);

  function handleEditFieldChange(event) {
    const { name, value } = event.target;
    setEditDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleToggleCompetency(option) {
    setSelectedCompetencies((prev) => {
      if (prev.includes(option)) {
        return prev.filter((value) => value !== option);
      }
      return [...prev, option];
    });
  }

  function handleStartEdit() {
    setEditDraft(createEditDraft(user));
    setSelectedCompetencies(normalizeSkills(user));
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setEditDraft(createEditDraft(user));
    setSelectedCompetencies(normalizeSkills(user));
    setIsEditing(false);
  }

  async function handleSaveProfile() {
    if (!user?.id) return;

    setIsSavingProfile(true);

    try {
      const payload = {
        ...user,
        ...editDraft,
        competencies: selectedCompetencies,
      };

      await userService.update(user.id, payload);

      setUser((prev) => ({
        ...prev,
        ...editDraft,
        competencies: selectedCompetencies,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Kunde inte spara profilen.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  return {
    isEditing,
    editDraft,
    selectedCompetencies,
    isSavingProfile,
    handleEditFieldChange,
    handleToggleCompetency,
    handleStartEdit,
    handleCancelEdit,
    handleSaveProfile,
  };
}

export { useProfileEdit };
