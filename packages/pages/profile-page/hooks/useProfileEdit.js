import { useEffect, useState } from "react";
import { userService } from "@zoplanner/api";
import { normalizeSkills } from "../utils/profile.utils";

function useProfileEdit(user, _initialUser, setUser) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setSelectedCompetencies(normalizeSkills(user));
  }, [user]);

  function handleToggleCompetency(option) {
    setSelectedCompetencies((prev) => {
      if (prev.includes(option)) {
        return prev.filter((value) => value !== option);
      }
      return [...prev, option];
    });
  }

  function handleStartEdit() {
    setSelectedCompetencies(normalizeSkills(user));
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setSelectedCompetencies(normalizeSkills(user));
    setIsEditing(false);
  }

  async function handleSaveProfile() {
    if (!user?.id) return;

    setIsSavingProfile(true);

    try {
      const payload = {
        ...user,
        competencies: selectedCompetencies,
      };

      await userService.update(user.id, payload);

      setUser((prev) => ({
        ...prev,
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
    selectedCompetencies,
    isSavingProfile,
    handleToggleCompetency,
    handleStartEdit,
    handleCancelEdit,
    handleSaveProfile,
  };
}

export { useProfileEdit };
