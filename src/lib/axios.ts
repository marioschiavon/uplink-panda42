import axios from "axios";
import { supabase } from "@/integrations/supabase/client";

export const api = axios.create({
  baseURL: "https://api.panda42.com.br/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add Supabase token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
