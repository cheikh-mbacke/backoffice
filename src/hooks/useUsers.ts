// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/users.service";
import { CreateUserDto, UpdateUserDto } from "../types";
import { toast } from "sonner";

export const useUsers = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => usersService.getAll(page, limit),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserDto) => usersService.create(data),
    onSuccess: () => {
      // Invalider toutes les pages de la liste des users
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Invalider aussi les stats SaaS qui dépendent des users
      queryClient.invalidateQueries({ queryKey: ["saas", "stats"] });
      toast.success("Utilisateur créé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        error.response?.data?.errorMessage || "Erreur lors de la création"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersService.update(id, data),
    onSuccess: (updatedUser) => {
      // Mettre à jour le cache de l'user individuel
      queryClient.setQueryData(["user", updatedUser.id], updatedUser);
      
      // Mettre à jour l'user dans toutes les listes paginées
      queryClient.setQueriesData<{ data: User[]; pagination: any }>(
        { queryKey: ["users"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((user) =>
              user.id === updatedUser.id ? updatedUser : user
            ),
          };
        }
      );
      
      // Invalider les stats SaaS car le nombre d'users peut avoir changé
      queryClient.invalidateQueries({ queryKey: ["saas", "stats"] });
      
      toast.success("Utilisateur modifié avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        error.response?.data?.errorMessage || "Erreur lors de la modification"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: (_, deletedId) => {
      // Retirer l'user de toutes les listes paginées
      queryClient.setQueriesData<{ data: User[]; pagination: any }>(
        { queryKey: ["users"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter((user) => user.id !== deletedId),
          };
        }
      );
      
      // Supprimer du cache individuel
      queryClient.removeQueries({ queryKey: ["user", deletedId] });
      
      // Invalider les stats SaaS
      queryClient.invalidateQueries({ queryKey: ["saas", "stats"] });
      
      toast.success("Utilisateur supprimé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        error.response?.data?.errorMessage || "Erreur lors de la suppression"
      );
    },
  });

  return {
    users: usersQuery.data?.data || [],
    pagination: usersQuery.data?.pagination,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    createUser: createMutation.mutate,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
};
