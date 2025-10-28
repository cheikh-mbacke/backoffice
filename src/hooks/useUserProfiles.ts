// src/hooks/useUserProfiles.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys, invalidateProfilesData } from "@/lib/queryKeys";

export const useUserProfiles = () => {
  const queryClient = useQueryClient();

  // Utiliser la même queryKey que auth.availableProfiles pour éviter les doublons
  const query = useQuery({
    queryKey: queryKeys.profiles.userProfiles,
    queryFn: () => authService.getAvailableProfiles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const refetch = () => {
    return query.refetch();
  };

  const invalidate = () => {
    // Utiliser la fonction centralisée pour invalider tous les caches liés
    return invalidateProfilesData(queryClient);
  };

  return {
    profiles: query.data?.profiles || [],
    hasDefaultProfile: query.data?.hasDefaultProfile || false,
    isLoading: query.isLoading,
    error: query.error,
    refetch,
    invalidate,
  };
};
