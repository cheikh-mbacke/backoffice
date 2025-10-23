// src/hooks/useProfiles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "../services/profiles.service";
import { CreateProfileDto, UpdateProfileDto } from "../types";
import { toast } from "sonner";

export const useProfiles = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const profilesQuery = useQuery({
    queryKey: ["profiles", page, limit],
    queryFn: () => profilesService.getAll(page, limit),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProfileDto) => profilesService.create(data),
    onSuccess: () => {
      // Invalider toutes les pages de la liste des profiles
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profil créé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as any).response?.data?.errorMessage ||
          "Erreur lors de la création"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileDto }) =>
      profilesService.update(id, data),
    onSuccess: (updatedProfile) => {
      // Mettre à jour le cache du profile individuel
      queryClient.setQueryData(["profile", updatedProfile.id], updatedProfile);

      // Mettre à jour le profile dans toutes les listes paginées
      queryClient.setQueriesData<{
        data: any[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>({ queryKey: ["profiles"] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((profile) =>
            profile.id === updatedProfile.id ? updatedProfile : profile
          ),
        };
      });

      toast.success("Profil modifié avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as any).response?.data?.errorMessage ||
          "Erreur lors de la modification"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => profilesService.delete(id),
    onSuccess: (_, deletedId) => {
      // Retirer le profile de toutes les listes paginées
      queryClient.setQueriesData<{
        data: any[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>({ queryKey: ["profiles"] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((profile) => profile.id !== deletedId),
        };
      });

      // Supprimer du cache individuel
      queryClient.removeQueries({ queryKey: ["profile", deletedId] });

      toast.success("Profil supprimé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as any).response?.data?.errorMessage ||
          "Erreur lors de la suppression"
      );
    },
  });

  return {
    profiles: profilesQuery.data?.data || [],
    pagination: profilesQuery.data?.pagination,
    isLoading: profilesQuery.isLoading,
    error: profilesQuery.error,
    createProfile: createMutation.mutate,
    updateProfile: updateMutation.mutate,
    deleteProfile: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useProfile = (id: string) => {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => profilesService.getById(id),
    enabled: !!id,
  });
};

export const useUserProfiles = (userId: string) => {
  return useQuery({
    queryKey: ["profiles", "user", userId],
    queryFn: () => profilesService.getByUserId(userId),
    enabled: !!userId,
  });
};
