import { useEffect, useState } from "react";
import { API_BASE_URL, FILES_BASE_URL, userService } from "@zoplanner/api";

const PROFILE_PICTURE_UPDATED_EVENT = "zoplanner:profile-picture-updated";

function normalizeProfilePictureUrl(value) {
  if (typeof value !== "string") return null;

  const url = value.trim();
  if (!url) return null;

  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  if (url.startsWith("/files/") || url.startsWith("files/")) {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${FILES_BASE_URL}${path}`;
  }

  return url.startsWith("/")
    ? `${API_BASE_URL}${url}`
    : `${API_BASE_URL}/${url}`;
}

function useProfilePicture(userId, initialPictureValue) {
  const [profilePicture, setProfilePicture] = useState(() =>
    normalizeProfilePictureUrl(initialPictureValue),
  );

  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Sync från props (t.ex. när user uppdateras)
  useEffect(() => {
    const normalized = normalizeProfilePictureUrl(initialPictureValue);

    setProfilePicture((prev) =>
      prev === normalized ? prev : normalized || null,
    );
  }, [initialPictureValue]);

  // Lyssna på global uppdatering
  useEffect(() => {
    if (!userId) return;

    const handler = (event) => {
      const { userId: eventUserId, profilePicture: pic } = event.detail || {};

      if (eventUserId && String(eventUserId) !== String(userId)) return;

      const normalized = normalizeProfilePictureUrl(pic);

      setProfilePicture((prev) =>
        prev === normalized ? prev : normalized || null,
      );
    };

    window.addEventListener(PROFILE_PICTURE_UPDATED_EVENT, handler);

    return () =>
      window.removeEventListener(PROFILE_PICTURE_UPDATED_EVENT, handler);
  }, [userId]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId) {
      alert("Kunde inte hitta användar-id.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Endast bilder!");
      return;
    }

    try {
      setIsUploadingPicture(true);
      const body = await userService.uploadProfilePicture(userId, file);

      const updated = normalizeProfilePictureUrl(
        body?.profilePicture || body?.profilePictureUrl,
      );

      if (!updated) {
        throw new Error("Ogiltigt svar från backend");
      }

      setProfilePicture(updated);

      window.dispatchEvent(
        new CustomEvent(PROFILE_PICTURE_UPDATED_EVENT, {
          detail: { userId, profilePicture: updated },
        }),
      );
    } catch (err) {
      console.error(err);
      alert("Något gick fel vid uppladdning av profilbild.");
    } finally {
      setIsUploadingPicture(false);
      e.target.value = "";
    }
  };

  return {
    profilePicture,
    isUploadingPicture,
    handleImageChange,
  };
}

export {
  useProfilePicture,
  normalizeProfilePictureUrl,
  PROFILE_PICTURE_UPDATED_EVENT,
};
