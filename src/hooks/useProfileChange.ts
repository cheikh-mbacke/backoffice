// src/hooks/useProfileChange.ts
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { invalidateCurrentUserData, invalidateProfilesData } from "@/lib/queryKeys";

/**
 * Hook pour gérer les changements de profil
 * 
 * Ce hook :
 * 1. Détecte les changements de profil (via currentProfileId dans user)
 * 2. Invalide tous les caches React Query pour forcer le rechargement des données
 * 3. Permet de s'assurer que les données sont toujours à jour après un changement de profil
 * 
 * Utilisation : Appeler ce hook dans MainLayout ou dans le composant racine
 */
export const useProfileChange = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Garder une référence du profil précédent pour éviter les invalidations inutiles
  const previousProfileIdRef = useRef<string | undefined>(undefined);
  const isInvalidatingRef = useRef<boolean>(false);

  useEffect(() => {
    const currentProfileId = user?.currentProfileId;
    const previousProfileId = previousProfileIdRef.current;

    // Vérifier si c'est vraiment un changement de profil
    const profileChanged = currentProfileId !== previousProfileId;

    // Ne rien faire si :
    // - Pas de changement de profil
    // - Déjà en train d'invalider
    // - Pas d'utilisateur
    if (!profileChanged || isInvalidatingRef.current || !user) {
      // Mettre à jour la référence même si pas de changement (pour l'initialisation)
      if (currentProfileId !== previousProfileId) {
        previousProfileIdRef.current = currentProfileId;
      }
      return;
    }

    // Marquer comme en train d'invalider
    isInvalidatingRef.current = true;

    // Invalider tous les caches liés à l'utilisateur et aux profils
    const invalidateAll = async () => {
      try {
        await Promise.all([
          invalidateCurrentUserData(queryClient),
          invalidateProfilesData(queryClient, user.id),
          // Invalider aussi les caches liés aux données métier (hotels, users, etc.)
          // car elles peuvent dépendre du profil sélectionné
          queryClient.invalidateQueries({ queryKey: ["hotels"] }),
          queryClient.invalidateQueries({ queryKey: ["users"] }),
          queryClient.invalidateQueries({ queryKey: ["saas"] }),
        ]);

        // Émettre un événement pour notifier les composants que le rechargement est terminé
        window.dispatchEvent(new CustomEvent("profile-changed", {
          detail: { profileId: currentProfileId }
        }));
      } catch (error) {
        // Erreur silencieuse lors de l'invalidation des queries
      } finally {
        isInvalidatingRef.current = false;
      }
    };

    void invalidateAll();

    // Mettre à jour la référence
    previousProfileIdRef.current = currentProfileId;
  }, [user?.currentProfileId, user?.id, queryClient]);

  // Initialiser la référence au montage
  useEffect(() => {
    if (user?.currentProfileId && !previousProfileIdRef.current) {
      previousProfileIdRef.current = user.currentProfileId;
    }
  }, [user?.currentProfileId]);

  return user?.currentProfileId;
};




