import { useEffect, useState } from "react";
import { resolveTemporaryManagerId } from "./dev-fusk/temporaryManagerIdResolver";

export function useCurrentManagerId() {
  const [managerId, setManagerId] = useState(() => {
    const stored = localStorage.getItem("managerId");
    return stored !== null ? Number(stored) : null;
  });

  useEffect(() => {
    async function syncManagerId() {
      const storedManagerId = localStorage.getItem("managerId");

      // Om managerId redan finns korrekt satt, använd det.
      if (storedManagerId !== null) {
        setManagerId(Number(storedManagerId));
        return;
      }

      // Fallback: försök härleda från inloggad user.
      const userId = localStorage.getItem("userId");

      if (userId === null) {
        setManagerId(null);
        return;
      }

      const resolvedManagerId = await resolveTemporaryManagerId(
        Number(userId),
      );

      if (resolvedManagerId !== null) {
        localStorage.setItem("managerId", String(resolvedManagerId));
        setManagerId(resolvedManagerId);
      }
    }

    syncManagerId();
  }, []);

  return managerId;
}