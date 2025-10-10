import { User, WppConfig } from "@/types";

const STORAGE_KEYS = {
  USER: "wpp_user",
  CONFIG: "wpp_config",
} as const;

// User storage (using sessionStorage)
export const getUser = (): User | null => {
  const user = sessionStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: User): void => {
  sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const removeUser = (): void => {
  sessionStorage.removeItem(STORAGE_KEYS.USER);
};

// Config storage (using localStorage)
export const getConfig = (): WppConfig => {
  const config = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return config
    ? JSON.parse(config)
    : {
        baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:21465",
        sessionName: "default",
      };
};

export const setConfig = (config: WppConfig): void => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};
