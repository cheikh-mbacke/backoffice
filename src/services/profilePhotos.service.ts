// src/services/profilePhotos.service.ts
import api from "@/config/api";

export interface UploadProfilePhotoResponse {
  status: string;
  message: string;
  timestamp: string;
  avatarUrl: string; // Le backend fusionne directement les données dans la réponse
}

export interface DeleteProfilePhotoResponse {
  status: string;
  message: string;
}

export const profilePhotosService = {
  /**
   * Upload d'une photo de profil
   * @param profileId - ID du profil
   * @param file - Fichier image à uploader
   * @returns Promise avec l'URL de la photo uploadée
   */
  async uploadProfilePhoto(
    profileId: string,
    file: File
  ): Promise<UploadProfilePhotoResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        `/profiles/${profileId}/avatar`,
        formData
        // Pas de headers - laisser le navigateur gérer Content-Type automatiquement
      );

      return response.data;
    } catch (error: any) {
      // Gestion d'erreur plus détaillée
      if (error.response?.status === 404) {
        throw new Error(
          "Route d'upload non trouvée. Vérifiez que le backend est démarré."
        );
      } else if (error.response?.status === 401) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      } else if (error.response?.status === 413) {
        throw new Error("Fichier trop volumineux. Taille maximale : 2MB");
      } else if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        throw new Error(
          "Impossible de se connecter au serveur. Vérifiez votre connexion."
        );
      } else {
        throw new Error("Erreur lors de l'upload de la photo");
      }
    }
  },

  /**
   * Suppression d'une photo de profil
   * @param profileId - ID du profil
   * @returns Promise de confirmation
   */
  async deleteProfilePhoto(
    profileId: string
  ): Promise<DeleteProfilePhotoResponse> {
    const response = await api.delete(`/profiles/${profileId}/avatar`);
    return response.data;
  },

  /**
   * Génère l'URL complète pour une photo de profil
   * @param avatarUrl - URL relative de la photo
   * @returns URL complète ou null si pas de photo
   */
  getProfilePhotoUrl(avatarUrl?: string): string | null {
    if (!avatarUrl) {
      return null;
    }

    // Si l'URL est déjà complète, la retourner telle quelle
    if (avatarUrl.startsWith("http")) {
      return avatarUrl;
    }

    // Construire l'URL complète avec la base de l'API
    const baseUrl = import.meta.env.DEV
      ? import.meta.env.VITE_API_URL || "http://localhost:3000"
      : "https://api.consignespro.com";

    const fullUrl = `${baseUrl}${avatarUrl}`;

    return fullUrl;
  },

  /**
   * Valide un fichier image avant upload
   * @param file - Fichier à valider
   * @returns Objet avec isValid et message d'erreur éventuel
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Vérifier le type MIME
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error:
          "Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP",
      };
    }

    // Vérifier la taille (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "Fichier trop volumineux. Taille maximale : 2MB",
      };
    }

    return { isValid: true };
  },

  /**
   * Redimensionne une image côté client avant upload
   * @param file - Fichier image original
   * @param maxWidth - Largeur maximale
   * @param maxHeight - Hauteur maximale
   * @param quality - Qualité de compression (0-1)
   * @returns Promise avec le fichier redimensionné
   */
  async resizeImage(
    file: File,
    maxWidth: number = 300,
    maxHeight: number = 300,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions en gardant les proportions
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Configurer le canvas
        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir en blob puis en File
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Erreur lors du redimensionnement"));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Erreur lors du chargement de l'image"));
      };

      img.src = URL.createObjectURL(file);
    });
  },
};
