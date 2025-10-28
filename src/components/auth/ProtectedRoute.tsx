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

  // Vérifier les profils après authentification
  useEffect(() => {
    if (isAuthenticated && user && !profileCheckComplete) {
      checkUserProfiles();
    }
  }, [isAuthenticated, user, profileCheckComplete, checkUserProfiles]);

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

  // Si authentifié mais pas de profil par défaut, rediriger vers login
  if (needsProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
