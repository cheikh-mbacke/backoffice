// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { LoginCredentials } from "../types";
import { useNavigate } from "react-router-dom";
import {
  queryKeys,
  invalidateCurrentUserData,
  invalidateProfilesData,
} from "@/lib/queryKeys";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      return user;
    },
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: async (data) => {
      // Mettre à jour directement le cache avec les données du user
      queryClient.setQueryData(queryKeys.auth.currentUser, data.user);
      // Invalider tous les caches liés à l'utilisateur
      await invalidateCurrentUserData(queryClient);
    },
    onError: () => {
      // Ne pas nettoyer le localStorage ici, c'est déjà fait par l'intercepteur si nécessaire
    },
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
  });

  const selectProfileMutation = useMutation({
    mutationFn: (profileId: string) => authService.selectProfile(profileId),
    onSuccess: async (data) => {
      // Mettre à jour le cache avec les nouvelles données utilisateur
      queryClient.setQueryData(queryKeys.auth.currentUser, data.user);

      // Invalider tous les caches liés à l'utilisateur ET aux profils
      await Promise.all([
        invalidateCurrentUserData(queryClient),
        invalidateProfilesData(queryClient, data.user.id),
      ]);
    },
  });

  // Query pour récupérer les profils disponibles
  const { data: availableProfiles, refetch: refetchProfiles } = useQuery({
    queryKey: queryKeys.auth.availableProfiles,
    queryFn: authService.getAvailableProfiles,
    enabled: false, // Ne charge que quand demandé
  });

  // Vérifier l'authentification : token présent ET user chargé
  const hasToken = authService.isAuthenticated();
  const hasUser = !!user;
  const isAuthenticated = hasToken && hasUser;

  return {
    user,
    isLoading,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    resetLoginError: loginMutation.reset,
    // Gestion des profils
    selectProfile: selectProfileMutation.mutateAsync,
    isSelectingProfile: selectProfileMutation.isPending,
    availableProfiles,
    refetchProfiles,
  };
};
