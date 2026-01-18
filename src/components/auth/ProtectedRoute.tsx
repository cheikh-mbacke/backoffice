// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [profileCheckComplete, setProfileCheckComplete] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);

  const checkUserProfiles = useCallback(async () => {
    try {
      const { profiles, hasDefaultProfile } =
        await authService.getAvailableProfiles();

      // Si aucun profil n'existe ou aucun profil par défaut, rediriger vers login
      if (profiles.length === 0 || !hasDefaultProfile) {
        setNeedsProfile(true);
      }
    } catch (error) {
      setNeedsProfile(true);
    } finally {
      setProfileCheckComplete(true);
    }
  }, []);

  // Vérifier les profils après authentification (sauf si on est déjà sur /profiles)
  useEffect(() => {
    if (isAuthenticated && user && !profileCheckComplete && location.pathname !== "/profiles") {
      checkUserProfiles();
    } else if (location.pathname === "/profiles") {
      // Si on est sur /profiles, marquer comme complété pour éviter les vérifications inutiles
      setProfileCheckComplete(true);
    }
  }, [isAuthenticated, user, profileCheckComplete, checkUserProfiles, location.pathname]);

  // Attendre que le chargement soit terminé avant de décider
  if (isLoading || (isAuthenticated && !profileCheckComplete)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, rediriger vers login avec le chemin actuel
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si on est déjà sur la page de sélection de profil, ne pas rediriger (éviter la boucle)
  if (location.pathname === "/profiles") {
    return <>{children}</>;
  }

  // Si authentifié mais pas de profil sélectionné, rediriger vers la sélection de profil
  // Note: Si currentProfileId est défini, on permet l'accès même si needsProfile est true
  // (car l'utilisateur vient peut-être de sélectionner un profil)
  if (isAuthenticated && !user?.currentProfileId) {
    return <Navigate to="/profiles" state={{ from: location }} replace />;
  }

  // Si pas de profil par défaut mais qu'un profil est sélectionné, permettre l'accès
  // (l'utilisateur pourra définir un profil par défaut plus tard)
  if (needsProfile && !user?.currentProfileId) {
    return <Navigate to="/profiles" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
