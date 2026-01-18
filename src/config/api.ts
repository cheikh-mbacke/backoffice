// src/config/api.ts
import axios, { AxiosError } from "axios";

// Configuration dynamique de l'URL de l'API selon l'environnement
const getApiBaseUrl = () => {
  // En développement, utiliser l'URL complète du backend avec /api/v1
  if (import.meta.env.DEV) {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const fullUrl = `${baseUrl}/api/v1`;
    return fullUrl;
  }
  // En production, utiliser l'URL complète de l'API
  const prodUrl = "https://api.consignespro.com/api/v1";
  return prodUrl;
};

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Ne pas définir Content-Type par défaut pour permettre multipart/form-data
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Intercepteur de requête pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ajouter Content-Type pour les requêtes JSON (pas pour FormData)
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
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
    const authHeader = response.headers["authorization"] || response.headers["Authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      localStorage.setItem("accessToken", token);
      // Mettre à jour aussi le refreshToken avec le nouveau token
      localStorage.setItem("refreshToken", token);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    // Si erreur 401 et pas déjà tenté de refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Vérifier si c'est une erreur de validation (mot de passe incorrect, etc.)
      // Dans ce cas, ne pas essayer de rafraîchir le token
      if ((error.response?.data as any)?.errorName === "INVALID_CREDENTIALS") {
        return Promise.reject(error);
      }

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
        if (newToken && originalRequest) {
          localStorage.setItem("accessToken", newToken);
          // Mettre à jour aussi le refreshToken avec le nouveau token
          localStorage.setItem("refreshToken", newToken);
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
