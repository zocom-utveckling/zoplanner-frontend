import { useEffect, useState } from "react";
import { userService } from "@zoplanner/api";
import {
  normalizeSkills,
  saveStoredCompetencies,
} from "../utils/profile.utils";

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

    const nextCompetencies = [...selectedCompetencies];
    saveStoredCompetencies(user.id, nextCompetencies);

    setUser((prev) => ({
      ...prev,
      competencies: nextCompetencies,
    }));

    try {
      const payload = {
        ...user,
        competencies: nextCompetencies,
      };

      await userService.update(user.id, payload);
    } catch (error) {
      console.warn(
        "Kunde inte spara kompetenser i backend, använder localStorage som fallback.",
        error,
      );
    } finally {
      setIsEditing(false);
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
