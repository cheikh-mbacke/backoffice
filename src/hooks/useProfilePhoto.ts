// src/hooks/useProfilePhoto.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profilePhotosService } from "@/services/profilePhotos.service";
import { toast } from "sonner";
import { queryKeys, invalidateProfilesData } from "@/lib/queryKeys";
import { User } from "@/types";

export const useProfilePhotoUpload = (
  profileId: string,
  onSuccess?: (avatarUrl: string) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      profilePhotosService.uploadProfilePhoto(profileId, file),
    onSuccess: async (response) => {
      // Le backend retourne avatarUrl directement dans la réponse (structure standardisée)
      const avatarUrl = response.avatarUrl;

      if (!avatarUrl) {
        toast.error("Erreur: URL de l'avatar non trouvée dans la réponse");
        return;
      }

      // Récupérer l'utilisateur actuel pour vérifier si c'est son profil actif
      const currentUser = queryClient.getQueryData<User>(
        queryKeys.auth.currentUser
      );

      // Si c'est le profil actuellement actif de l'utilisateur, mettre à jour currentUser
      if (currentUser && currentUser.currentProfileId === profileId) {
        const updatedUser = {
          ...currentUser,
          currentProfileAvatarUrl: avatarUrl,
        };
        queryClient.setQueryData(queryKeys.auth.currentUser, updatedUser);
      } else {
      }

      // Invalider tous les caches liés aux profils
      await invalidateProfilesData(queryClient);

      toast.success(response.message);

      // Appeler le callback si fourni
      if (onSuccess) {
        onSuccess(avatarUrl);
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message ||
          "Erreur lors de la mise à jour de la photo"
      );
    },
  });
};

export const useProfilePhotoDelete = (
  profileId: string,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profilePhotosService.deleteProfilePhoto(profileId),
    onSuccess: async (response) => {
      // Récupérer l'utilisateur actuel pour vérifier si c'est son profil actif
      const currentUser = queryClient.getQueryData<User>(
        queryKeys.auth.currentUser
      );

      // Si c'est le profil actuellement actif de l'utilisateur, mettre à jour currentUser
      if (currentUser && currentUser.currentProfileId === profileId) {
        const updatedUser = {
          ...currentUser,
          currentProfileAvatarUrl: undefined,
        };
        queryClient.setQueryData(queryKeys.auth.currentUser, updatedUser);
      }

      // Invalider tous les caches liés aux profils
      await invalidateProfilesData(queryClient);

      toast.success(response.message);

      // Appeler le callback si fourni
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la photo");
    },
  });
};
