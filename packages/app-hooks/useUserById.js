import { useEffect, useState } from "react";
import { userService } from "@zoplanner/api";

function useUserById(id, initialUser = null) {
  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialUser && !!id);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    if (!id || initialUser) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getById(id);
        if (isActive) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (isActive) setError(err);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isActive = false;
    };
  }, [id, initialUser]);

  return { user, setUser, loading, error };
}

export { useUserById };