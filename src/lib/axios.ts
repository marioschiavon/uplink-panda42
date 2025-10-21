import axios from "axios";
import { supabase } from "@/integrations/supabase/client";

export const api = axios.create({
  baseURL: "https://api.panda42.com.br",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add Supabase token
api.interceptors.request.use((config) => {
  const sessionJSON = localStorage.getItem("sb-" + import.meta.env.VITE_SUPABASE_PROJECT_ID + "-auth-token");
  if (sessionJSON) {
    try {
      const session = JSON.parse(sessionJSON);
      const token = session?.access_token;
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
  }
  return config;
});



// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("wpp_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
