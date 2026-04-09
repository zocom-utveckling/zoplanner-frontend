import { useEffect, useState } from "react";
import { userService } from "@zoplanner/api";

function useUserById(id) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    if (!id) {
  setUser(null);
  setLoading(false);
  return;
}

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getById(id);
        if (isActive){
setUser(data);
        setError(null);
        }
        
      } catch (err) {
        if (isActive) {
        setError(err);
      }
      } finally {
       if (isActive) {
        setLoading(false);
      }
      }
    };

    fetchUser();


    return () => {
      isActive = false;
 };
  }, [id]);

  return { user, loading, error };
}

export { useUserById };