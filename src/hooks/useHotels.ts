// src/hooks/useHotels.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelsService } from "../services/hotels.service";
import { CreateHotelDto, UpdateHotelDto, Hotel } from "../types";
import { toast } from "sonner";
import { queryKeys, invalidateHotelsData } from "@/lib/queryKeys";

export const useHotels = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const hotelsQuery = useQuery({
    queryKey: queryKeys.hotels.all(page, limit),
    queryFn: () => hotelsService.getAll(page, limit),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateHotelDto) => hotelsService.create(data),
    onSuccess: async (response) => {
      // Invalider tous les caches liés aux hôtels (incluant SaaS)
      await invalidateHotelsData(queryClient);
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
    mutationFn: ({ id, data }: { id: string; data: UpdateHotelDto }) =>
      hotelsService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ["hotels"] });

      // Sauvegarder l'état précédent pour un rollback éventuel
      const previousHotels = queryClient.getQueriesData({
        queryKey: ["hotels"],
      });

      // Optimistic update: mettre à jour immédiatement l'UI
      queryClient.setQueriesData<{
        data: Hotel[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>({ queryKey: ["hotels"] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((hotel) =>
            hotel.id === id ? { ...hotel, ...data } : hotel
          ),
        };
      });

      return { previousHotels };
    },
    onSuccess: async (response) => {
      const { hotel: updatedHotel, message } = response;

      // Mettre à jour le cache de l'hotel individuel
      queryClient.setQueryData(
        queryKeys.hotels.detail(updatedHotel.id),
        updatedHotel
      );

      // Mettre à jour toutes les listes paginées en s'assurant que la structure correspond
      queryClient.setQueriesData(
        { queryKey: ["hotels"] },
        (oldData: unknown) => {
          if (
            !oldData ||
            typeof oldData !== "object" ||
            !("data" in oldData) ||
            !Array.isArray((oldData as any).data)
          ) {
            return oldData;
          }

          const typedData = oldData as {
            data: Hotel[];
            pagination?: {
              total: number;
              page: number;
              limit: number;
              totalPages: number;
            };
          };

          return {
            ...typedData,
            data: typedData.data.map((hotel) =>
              hotel.id === updatedHotel.id ? updatedHotel : hotel
            ),
          };
        }
      );

      // Invalider tous les caches liés aux hôtels
      await invalidateHotelsData(queryClient);

      toast.success(message);
    },
    onError: (error: unknown, _, context) => {
      // Rollback en cas d'erreur
      if (context?.previousHotels) {
        context.previousHotels.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

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
    mutationFn: (id: string) => hotelsService.delete(id),
    onSuccess: async (response, deletedId) => {
      // Retirer l'hotel de toutes les listes paginées
      queryClient.setQueriesData<{
        data: Hotel[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>({ queryKey: ["hotels"] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((hotel) => hotel.id !== deletedId),
        };
      });

      // Supprimer du cache individuel
      queryClient.removeQueries({
        queryKey: queryKeys.hotels.detail(deletedId),
      });

      // Invalider tous les caches liés aux hôtels
      await invalidateHotelsData(queryClient);

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
    hotels: hotelsQuery.data?.data || [],
    pagination: hotelsQuery.data?.pagination,
    isLoading: hotelsQuery.isLoading,
    error: hotelsQuery.error,
    createHotel: createMutation.mutate,
    updateHotel: updateMutation.mutate,
    deleteHotel: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useHotel = (id: string) => {
  return useQuery({
    queryKey: queryKeys.hotels.detail(id),
    queryFn: () => hotelsService.getById(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 secondes - données considérées fraîches pendant 30s
    refetchInterval: 60 * 1000, // Rafraîchir toutes les 60 secondes
  });
};

export const useHotelUsers = (id: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.hotels.users(id, page, limit),
    queryFn: () => hotelsService.getHotelUsers(id, page, limit),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 secondes
  });
};
