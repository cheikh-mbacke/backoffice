// src/config/api.ts
import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requête pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🚀 [API] Requête envoyée:", {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenPreview: token.substring(0, 20) + "...",
      });
    } else {
      console.log("⚠️ [API] Requête sans token:", {
        url: config.url,
        method: config.method,
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs et le refresh token
api.interceptors.response.use(
  (response) => {
    // Extraire le token du header si présent
    const authHeader = response.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      localStorage.setItem("accessToken", token);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si erreur 401 et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Tenter de rafraîchir le token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newToken = response.headers["authorization"]?.substring(7);
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh échoue, nettoyer le localStorage
        // MAIS NE PAS REDIRIGER ICI - laisser React Router gérer ça
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Retourner l'erreur pour que le composant puisse la gérer
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
