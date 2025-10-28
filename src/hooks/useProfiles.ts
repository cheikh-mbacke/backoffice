// src/hooks/useProfiles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "../services/profiles.service";
import { CreateProfileDto, UpdateProfileDto, Profile } from "../types";
import { toast } from "sonner";
import { queryKeys, invalidateProfilesData } from "@/lib/queryKeys";

export const useProfiles = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const profilesQuery = useQuery({
    queryKey: queryKeys.profiles.all(page, limit),
    queryFn: () => profilesService.getAll(page, limit),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProfileDto) => profilesService.create(data),
    onSuccess: async (response, variables) => {
      // Invalider tous les caches liés aux profils (incluant currentUser)
      await invalidateProfilesData(queryClient, variables.userId);
      toast.success(response.message);
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { errorMessage?: string } };
      };
      toast.error(
        axiosError.response?.data?.errorMessage || "Erreur lors de la création"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileDto }) =>
      profilesService.update(id, data),
    onSuccess: async (response) => {
      const { profile: updatedProfile, message } = response;

      // Mettre à jour le cache du profile individuel
      queryClient.setQueryData(
        queryKeys.profiles.detail(updatedProfile.id),
        updatedProfile
      );

      // Mettre à jour le profile dans toutes les listes paginées
      queryClient.setQueriesData<{
        data: Profile[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>({ queryKey: ["profiles"] }, (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((profile) =>
            profile.id === updatedProfile.id ? updatedProfile : profile
          ),
        };
      });

      // Invalider tous les caches liés aux profils (incluant currentUser)
      await invalidateProfilesData(queryClient, updatedProfile.userId);

      // Mettre à jour manuellement le cache currentUser si c'est le profil actuel
      const currentUser = queryClient.getQueryData(queryKeys.auth.currentUser) as any;
      if (currentUser && currentUser.currentProfileId === updatedProfile.id) {
        queryClient.setQueryData(queryKeys.auth.currentUser, {
          ...currentUser,
          currentProfileName: updatedProfile.name,
          currentProfileAvatarUrl: updatedProfile.avatarUrl,
        });
      }

      // Afficher le message du backend
      toast.success(message);
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { errorMessage?: string } };
      };
      toast.error(
        axiosError.response?.data?.errorMessage ||
          "Erreur lors de la modification"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => profilesService.delete(id),
    onSuccess: async (response, deletedId) => {
      // Retirer le profile de toutes les listes paginées
      queryClient.setQueriesData<{
        data: Profile[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>({ queryKey: ["profiles"] }, (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((profile) => profile.id !== deletedId),
        };
      });

      // Supprimer du cache individuel
      queryClient.removeQueries({
        queryKey: queryKeys.profiles.detail(deletedId),
      });

      // Invalider tous les caches liés aux profils
      await invalidateProfilesData(queryClient);

      toast.success(response.message);
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { errorMessage?: string } };
      };
      toast.error(
        axiosError.response?.data?.errorMessage ||
          "Erreur lors de la suppression"
      );
    },
  });

  return {
    profiles: profilesQuery.data?.data || [],
    pagination: profilesQuery.data?.pagination,
    isLoading: profilesQuery.isLoading,
    error: profilesQuery.error,
    createProfile: createMutation.mutateAsync,
    updateProfile: updateMutation.mutateAsync,
    deleteProfile: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch: profilesQuery.refetch,
  };
};

export const useProfile = (id: string) => {
  return useQuery({
    queryKey: queryKeys.profiles.detail(id),
    queryFn: () => profilesService.getById(id),
    enabled: !!id,
  });
};

export const useUserProfiles = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.profiles.byUser(userId),
    queryFn: () => profilesService.getByUserId(userId),
    enabled: !!userId,
  });
};
