import { useEffect, useState } from "react";
import { getCurrentUser, User } from "@/api/users";

export const useUserRole = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    user,
    loading,
    isAdmin: user?.role === "admin",
    isAgent: user?.role === "agent",
  };
};
