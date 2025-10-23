// src/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { LoginCredentials } from "../types";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("🔍 [useAuth] Récupération des données utilisateur...");
      const user = await authService.getCurrentUser();
      console.log("👤 [useAuth] Utilisateur récupéré:", {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        hotelId: user.hotelId,
      });
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
      queryClient.setQueryData(["currentUser"], data.user);
      // Invalider la query pour s'assurer que les données sont fraîches
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error) => {
      console.error("Erreur de connexion:", error);
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
  };
};
