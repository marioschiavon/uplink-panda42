import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  initialize: () => {
    const userStr = sessionStorage.getItem("wpp_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      set({ user, isAuthenticated: user.isAuthenticated });
    }
  },

  login: async (username: string, password: string) => {
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const user: User = {
      id: "1",
      username,
      isAuthenticated: true,
    };

    sessionStorage.setItem("wpp_user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem("wpp_user");
    set({ user: null, isAuthenticated: false });
  },
}));
