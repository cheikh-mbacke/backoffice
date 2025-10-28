// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/users.service";
import { CreateUserDto, UpdateUserDto, User } from "../types";
import { toast } from "sonner";
import { queryKeys, invalidateUsersData } from "@/lib/queryKeys";

export const useUsers = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: queryKeys.users.all(page, limit),
    queryFn: () => usersService.getAll(page, limit),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserDto) => usersService.create(data),
    onSuccess: async (response, variables) => {
      // Invalider tous les caches liés aux utilisateurs
      await invalidateUsersData(queryClient, variables.hotelId || undefined);
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
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersService.update(id, data),
    onSuccess: async (response) => {
      const { message } = response;

      // Invalider tous les caches liés aux utilisateurs pour forcer le rechargement
      await invalidateUsersData(queryClient);

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
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: async (response, deletedId) => {
      // Retirer l'user de toutes les listes paginées
      queryClient.setQueriesData<{
        data: User[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>({ queryKey: ["users"] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((user) => user.id !== deletedId),
        };
      });

      // Supprimer du cache individuel
      queryClient.removeQueries({
        queryKey: queryKeys.users.detail(deletedId),
      });

      // Invalider tous les caches liés aux utilisateurs
      await invalidateUsersData(queryClient);

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
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
};
