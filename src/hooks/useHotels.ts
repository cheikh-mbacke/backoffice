// src/hooks/useHotels.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelsService } from "../services/hotels.service";
import { CreateHotelDto, UpdateHotelDto } from "../types";
import { toast } from "sonner";

export const useHotels = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const hotelsQuery = useQuery({
    queryKey: ["hotels", page, limit],
    queryFn: () => hotelsService.getAll(page, limit),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateHotelDto) => hotelsService.create(data),
    onSuccess: () => {
      // Invalider toutes les pages de la liste des hotels
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      // Invalider aussi les stats SaaS qui dépendent des hotels
      queryClient.invalidateQueries({ queryKey: ["saas", "stats"] });
      toast.success("Hôtel créé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        error.response?.data?.errorMessage || "Erreur lors de la création"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHotelDto }) =>
      hotelsService.update(id, data),
    onSuccess: (updatedHotel) => {
      // Mettre à jour le cache de l'hotel individuel
      queryClient.setQueryData(["hotel", updatedHotel.id], updatedHotel);
      
      // Mettre à jour l'hotel dans toutes les listes paginées
      queryClient.setQueriesData<{ data: Hotel[]; pagination: any }>(
        { queryKey: ["hotels"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((hotel) =>
              hotel.id === updatedHotel.id ? updatedHotel : hotel
            ),
          };
        }
      );
      
      // Invalider les stats SaaS car le statut/plan peut avoir changé
      queryClient.invalidateQueries({ queryKey: ["saas", "stats"] });
      
      toast.success("Hôtel modifié avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        error.response?.data?.errorMessage || "Erreur lors de la modification"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hotelsService.delete(id),
    onSuccess: (_, deletedId) => {
      // Retirer l'hotel de toutes les listes paginées
      queryClient.setQueriesData<{ data: Hotel[]; pagination: any }>(
        { queryKey: ["hotels"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter((hotel) => hotel.id !== deletedId),
          };
        }
      );
      
      // Supprimer du cache individuel
      queryClient.removeQueries({ queryKey: ["hotel", deletedId] });
      
      // Invalider les stats SaaS
      queryClient.invalidateQueries({ queryKey: ["saas", "stats"] });
      
      toast.success("Hôtel supprimé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        error.response?.data?.errorMessage || "Erreur lors de la suppression"
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
    queryKey: ["hotel", id],
    queryFn: () => hotelsService.getById(id),
    enabled: !!id,
  });
};
