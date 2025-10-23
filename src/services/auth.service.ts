// src/services/auth.service.ts
import api from "../config/api";
import { LoginCredentials, AuthResponse, User } from "../types";

export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> {
    // Nettoyer le localStorage avant le login
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      // Extraire le token du header (vérifier les deux casse)
      const authHeader =
        response.headers["authorization"] || response.headers["Authorization"];
      const token = authHeader?.substring(7) || "";

      // Stocker les tokens
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
      }

      return {
        user: {
          id: response.data.id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          role: response.data.role,
          hotelId: response.data.hotelId,
          createdAt: new Date().toISOString(), // Valeur par défaut
          updatedAt: new Date().toISOString(), // Valeur par défaut
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Nettoyer aussi les anciennes clés au cas où
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  async getCurrentUser(): Promise<User> {
    console.log("🔐 [authService] Appel de /auth/me...");
    console.log(
      "🔑 [authService] Token actuel:",
      this.getToken() ? "Présent" : "Absent"
    );

    const response = await api.get<AuthResponse>("/auth/me");

    console.log("👤 [authService] Réponse de /auth/me:", {
      id: response.data.id,
      email: response.data.email,
      role: response.data.role,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      hotelId: response.data.hotelId,
    });

    return {
      id: response.data.id,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      role: response.data.role,
      hotelId: response.data.hotelId,
      createdAt: response.data.createdAt || new Date().toISOString(),
      updatedAt: response.data.updatedAt || new Date().toISOString(),
    };
  },

  async refreshToken(refreshToken: string): Promise<string> {
    const response = await api.post("/auth/refresh", { refreshToken });
    const authHeader = response.headers["authorization"];
    const newToken = authHeader?.substring(7) || "";

    if (newToken) {
      localStorage.setItem("accessToken", newToken);
    }

    return newToken;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  },

  getToken(): string | null {
    return localStorage.getItem("accessToken");
  },
};
