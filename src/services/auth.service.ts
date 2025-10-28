// src/services/auth.service.ts
import api from "../config/api";
import { LoginCredentials, AuthResponse, User, Profile } from "../types";

export const authService = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> {
    // Nettoyer le localStorage avant le login
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    const response = await api.post<AuthResponse>("/auth/login", credentials);

    // Extraire le token du header (vérifier les deux casse)
    const authHeader =
      response.headers["authorization"] || response.headers["Authorization"];
    const token = authHeader?.substring(7) || "";

    // Stocker les tokens
    if (token) {
      localStorage.setItem("accessToken", token);
    }

    return {
      user: {
        id: response.data.id,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        role: response.data.role,
        hotelId: response.data.hotelId,
        phone: response.data.phone,
        position: response.data.position,
        isDefault: response.data.isDefault,
        createdAt: response.data.createdAt || new Date().toISOString(),
        updatedAt: response.data.updatedAt || new Date().toISOString(),
        // Informations du profil actuel depuis le JWT
        currentProfileId: response.data.currentProfileId || undefined,
        currentProfileName: response.data.currentProfileName || undefined,
        currentProfileRole: response.data.currentProfileRole || undefined,
        currentProfileAvatarUrl: response.data.currentProfileAvatarUrl || undefined,
      },
      token,
    };
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignorer les erreurs de logout côté serveur
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Nettoyer aussi les anciennes clés au cas où
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<AuthResponse>("/auth/me");

    return {
      id: response.data.id,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      role: response.data.role,
      hotelId: response.data.hotelId,
      phone: response.data.phone,
      position: response.data.position,
      isDefault: response.data.isDefault,
      createdAt: response.data.createdAt || new Date().toISOString(),
      updatedAt: response.data.updatedAt || new Date().toISOString(),
      // Informations du profil actuel depuis le JWT
      currentProfileId: response.data.currentProfileId || undefined,
      currentProfileName: response.data.currentProfileName || undefined,
      currentProfileRole: response.data.currentProfileRole || undefined,
      currentProfileAvatarUrl: response.data.currentProfileAvatarUrl || undefined,
    };
  },

  /**
   * Récupérer les profils disponibles pour l'utilisateur connecté
   */
  async getAvailableProfiles(): Promise<{
    profiles: Profile[];
    hasDefaultProfile: boolean;
  }> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      profiles: Profile[];
      hasDefaultProfile: boolean;
    }>("/auth/profiles");
    return {
      profiles: response.data.profiles,
      hasDefaultProfile: response.data.hasDefaultProfile,
    };
  },

  /**
   * Sélectionner un profil et obtenir un nouveau JWT
   */
  async selectProfile(
    profileId: string
  ): Promise<{ user: User; token: string }> {
    const response = await api.post<{
      status: string;
      message: string;
      timestamp: string;
      profile: Profile;
    }>("/auth/select-profile", {
      profileId,
    });

    // Extraire le nouveau token du header
    const authHeader =
      response.headers["authorization"] || response.headers["Authorization"];
    const token = authHeader?.substring(7) || "";

    // Stocker le nouveau token
    if (token) {
      localStorage.setItem("accessToken", token);
    }

    // Récupérer les informations mises à jour de l'utilisateur
    const updatedUser = await this.getCurrentUser();

    return {
      user: updatedUser,
      token,
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

  /**
   * Changer le mot de passe
   */
  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    try {
      // Récupérer l'utilisateur actuel pour obtenir son ID
      const currentUser = await this.getCurrentUser();

      const response = await api.put<{
        status: string;
        message: string;
        timestamp: string;
      }>(`/users/${currentUser.id}`, {
        password: data.newPassword,
        currentPassword: data.oldPassword,
      });
      return { message: response.data.message };
    } catch (error: any) {
      console.error("🔐 Change Password Error:", error);
      console.error("🔐 Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });

      // Gestion d'erreur spécifique pour le changement de mot de passe
      if (error.response?.status === 401) {
        console.log("🔐 401 Error details:", {
          errorName: error.response?.data?.errorName,
          errorMessage: error.response?.data?.errorMessage,
          fullResponse: error.response?.data,
        });

        // PRIORITÉ 1: Vérifier si c'est une erreur de mot de passe actuel incorrect
        if (error.response?.data?.errorName === "INVALID_CREDENTIALS") {
          console.log("🔐 Detected INVALID_CREDENTIALS - not logging out");
          throw new Error("Mot de passe actuel incorrect");
        }

        // PRIORITÉ 2: Afficher l'errorMessage du backend si disponible
        if (error.response?.data?.errorMessage) {
          console.log(
            "🔐 Using backend errorMessage:",
            error.response.data.errorMessage
          );
          throw new Error(error.response.data.errorMessage);
        }

        // PRIORITÉ 3: Si c'est vraiment une session expirée (pas d'errorName/errorMessage spécifique)
        console.warn(
          "🔐 401 Error - Session expired, attempting token refresh"
        );

        // Essayer de rafraîchir le token d'abord
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            // Le token refresh sera géré par l'intercepteur axios
            throw new Error("Session expirée. Veuillez vous reconnecter.");
          }
        } catch (refreshError) {
          // Si le refresh échoue, alors c'est vraiment une déconnexion
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          throw new Error(
            "Session expirée après changement de mot de passe. Veuillez vous reconnecter."
          );
        }

        throw new Error("Session expirée. Veuillez vous reconnecter.");
      } else if (error.response?.status === 400) {
        if (error.response?.data?.errorMessage) {
          throw new Error(error.response.data.errorMessage);
        }
        throw new Error("Données invalides. Vérifiez votre saisie.");
      } else if (error.response?.status === 403) {
        // Afficher l'errorMessage du backend si disponible
        if (error.response?.data?.errorMessage) {
          throw new Error(error.response.data.errorMessage);
        }
        throw new Error(
          "Vous n'avez pas l'autorisation de modifier ce compte."
        );
      } else if (error.response?.status === 404) {
        // Afficher l'errorMessage du backend si disponible
        if (error.response?.data?.errorMessage) {
          throw new Error(error.response.data.errorMessage);
        }
        throw new Error("Utilisateur non trouvé.");
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        console.error("🔐 Network error details:", {
          code: error.code,
          message: error.message,
          config: error.config,
        });
        throw new Error(
          "Impossible de se connecter au serveur. Vérifiez votre connexion."
        );
      } else {
        // En dernier recours, essayer d'afficher l'errorMessage du backend
        if (error.response?.data?.errorMessage) {
          throw new Error(error.response.data.errorMessage);
        }
        throw new Error("Erreur lors du changement de mot de passe");
      }
    }
  },

  getToken(): string | null {
    return localStorage.getItem("accessToken");
  },
};
