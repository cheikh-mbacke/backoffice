// src/pages/ProfileSelectionPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowRight, Edit2, Trash2, CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { authService } from "@/services/auth.service";
import { profilesService } from "@/services/profiles.service";
import { Profile, UserRole } from "@/types";
import { toast } from "sonner";
import { queryKeys, invalidateProfilesData, invalidateCurrentUserData } from "@/lib/queryKeys";
import { profilePhotosService } from "@/services/profilePhotos.service";
import { getRoleLabel } from "@/lib/utils";
import {
  ProfileCreateModal,
  ProfileEditModal,
  ProfileDeleteModal,
  ProfilePinModal,
} from "@/components/profile/ProfileModals";

export function ProfileSelectionPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const queryClient = useQueryClient();
  const { profiles, hasDefaultProfile, isLoading: isLoadingProfiles, refetch: refetchProfiles } = useUserProfiles();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isSwitchMode =
    (location.state as { mode?: string } | null)?.mode === "switch" ||
    new URLSearchParams(location.search).get("mode") === "switch";

  // États locaux
  const [selectingProfileId, setSelectingProfileId] = useState<string | null>(null);
  const [profileRequiringPin, setProfileRequiringPin] = useState<Profile | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // États pour les modales Edit/Delete
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);

  const currentProfileId = user?.currentProfileId;

  // Rediriger vers login si pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rediriger vers dashboard si profil déjà sélectionné et pas en mode switch
  useEffect(() => {
    if (!isSwitchMode && currentProfileId && !isLoadingProfiles) {
      navigate("/", { replace: true });
    }
  }, [isSwitchMode, currentProfileId, isLoadingProfiles, navigate]);

  // Afficher un loader si on est en train de rediriger
  if (!isSwitchMode && currentProfileId && !isLoadingProfiles) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Redirection...</p>
        </div>
      </div>
    );
  }

  // Forcer l'ouverture du dialog de création si pas de profil par défaut
  useEffect(() => {
    if (!isLoadingProfiles && hasDefaultProfile === false && profiles.length === 0) {
      setShowCreateDialog(true);
    }
  }, [isLoadingProfiles, hasDefaultProfile, profiles.length]);

  // Fonction pour vérifier les permissions
  const checkPermission = (profile: Profile, action: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'MANAGER') return profile.hotelId === user.hotelId;

    if (user.role === 'STAFF') {
      if (String(profile.userId) !== String(user.id)) {
        return false;
      }

      if (action === 'select') {
        return true;
      }

      if (action === 'edit' || action === 'delete') {
        if (profile.role === 'MANAGER') {
          return false;
        }
        if (action === 'delete' && profile.isDefault) {
          return false;
        }
        return true;
      }

      if (action === 'activate' || action === 'setDefault') {
        return false;
      }
    }

    return false;
  };

  const canEditProfile = (profile: Profile) => checkPermission(profile, 'edit');
  const canDeleteProfile = (profile: Profile) => checkPermission(profile, 'delete');

  const handleSelectProfile = async (profile: Profile, pinValue?: string) => {
    setSelectingProfileId(profile.id);
    setPinError(null);
    setFeedback(null);

    try {
      const { user: updatedUser, token } = await authService.selectProfile(profile.id, pinValue);
      
      // Vérifier que currentProfileId est bien défini
      if (!updatedUser.currentProfileId) {
        setFeedback("Erreur : le profil n'a pas été correctement sélectionné. Veuillez réessayer.");
        setSelectingProfileId(null);
        return;
      }

      // Mettre à jour le cache de l'utilisateur avec les nouvelles données
      queryClient.setQueryData(queryKeys.auth.currentUser, updatedUser);

      // Invalider tous les caches liés pour forcer le rechargement
      await Promise.all([
        invalidateCurrentUserData(queryClient),
        invalidateProfilesData(queryClient, updatedUser.id),
      ]);

      // Forcer le rechargement du hook useAuth pour s'assurer que les données sont à jour
      await queryClient.refetchQueries({ queryKey: queryKeys.auth.currentUser });

      toast.success(`Profil "${profile.name}" sélectionné`);

      // Vérifier si un profil par défaut existe maintenant
      const updatedProfiles = await refetchProfiles();
      const hasDefault = updatedProfiles.data?.hasDefaultProfile || false;

      // Si pas de profil par défaut et qu'on n'est pas en mode switch, ouvrir le modal d'édition
      if (!hasDefault && !isSwitchMode) {
        setSelectingProfileId(null);
        setEditingProfile(profile);
        setIsEditModalOpen(true);
        setFeedback("Veuillez définir ce profil comme profil par défaut pour continuer.");
        return;
      }

      // Réinitialiser l'état de sélection
      setSelectingProfileId(null);

      // Rediriger vers le dashboard (ou rester sur la page si en mode switch)
      if (!isSwitchMode) {
        // Utiliser window.location.replace pour forcer un rechargement complet
        // Cela garantit que ProtectedRoute détecte le currentProfileId depuis le nouveau JWT
        // Le token est déjà stocké dans localStorage par authService.selectProfile
        // Attendre un court instant pour s'assurer que le token est bien stocké
        // puis forcer un rechargement complet de la page
        setTimeout(() => {
          window.location.href = "/";
        }, 50);
      }
      // En mode switch, on reste sur la page
    } catch (error: any) {
      const errorMessage = error.response?.data?.errorMessage || error.message || "";
      const errorName = error.response?.data?.errorName || "";

      if (errorName === "PIN_REQUIRED" || errorMessage.includes("PIN requis")) {
        setProfileRequiringPin(profile);
        setSelectingProfileId(null);
      } else if (errorName === "INVALID_PIN" || errorMessage.includes("PIN incorrect")) {
        setProfileRequiringPin(profile);
        setPinError(errorMessage || "PIN incorrect");
        setSelectingProfileId(null);
      } else {
        setFeedback(errorMessage || "Erreur lors de la sélection du profil");
        setSelectingProfileId(null);
      }
    }
  };

  const handleProfileClick = (profile: Profile) => {
    const hasPin = profile.pin_hash !== null && profile.pin_hash !== undefined && profile.pin_hash !== "";
    
    if (hasPin) {
      setProfileRequiringPin(profile);
      setPinError(null);
    } else {
      handleSelectProfile(profile);
    }
  };

  const handlePinSubmit = async (pin: string) => {
    if (profileRequiringPin) {
      await handleSelectProfile(profileRequiringPin, pin);
    }
  };

  const handleEditProfile = (event: React.MouseEvent, profile: Profile) => {
    event.stopPropagation();
    
    if (!checkPermission(profile, 'edit')) {
      setFeedback("Vous n'avez pas la permission de modifier ce profil.");
      return;
    }

    setEditingProfile(profile);
    setIsEditModalOpen(true);
  };

  const handleDeleteProfile = (event: React.MouseEvent, profile: Profile) => {
    event.stopPropagation();

    if (profile.isDefault) {
      setFeedback("Impossible de supprimer le profil par défaut. Définissez d'abord un autre profil par défaut.");
      return;
    }

    if (!canDeleteProfile(profile)) {
      setFeedback("Vous n'avez pas la permission de supprimer ce profil.");
      return;
    }

    setDeletingProfile(profile);
    setDeleteModalError(null);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProfile) return;

    setDeletingProfileId(deletingProfile.id);

    try {
      await profilesService.delete(deletingProfile.id);
      await refetchProfiles();
      
      window.dispatchEvent(new CustomEvent('profile-changed', { 
        detail: { 
          profileId: deletingProfile.id,
          action: 'profile-delete',
          timestamp: Date.now()
        } 
      }));
      
      toast.success('Profil supprimé avec succès');
      setIsDeleteModalOpen(false);
      setDeletingProfile(null);
    } catch (error: any) {
      setDeleteModalError(
        error.response?.data?.errorMessage || 'Erreur lors de la suppression du profil'
      );
    } finally {
      setDeletingProfileId(null);
    }
  };

  const handleCloseCreateDialog = () => {
    if (hasDefaultProfile === false && profiles.length === 0) {
      setFeedback("Vous devez créer un profil par défaut pour continuer.");
      return;
    }
    setShowCreateDialog(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      navigate("/login");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "MANAGER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "STAFF":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const refreshProfiles = async () => {
    const result = await refetchProfiles();
    return result.data?.profiles || [];
  };

  if (isLoadingProfiles) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement de vos profils...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2 whitespace-nowrap">
                Bienvenue {user?.firstName} !
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 whitespace-nowrap">
                Sélectionnez votre profil pour continuer
              </p>
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">Déco</span>
              </Button>
            </div>
          </div>
        </div>

        {hasDefaultProfile === false && (
          <div className="mb-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-md text-sm">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="font-medium mb-1">Profil par défaut requis</p>
                  <p className="text-sm">
                    {profiles.length > 0
                      ? "Vous devez définir un profil par défaut pour continuer. Sélectionnez un profil existant et marquez-le comme par défaut, ou créez un nouveau profil par défaut."
                      : "Vous devez créer un profil par défaut pour continuer. Cette action est obligatoire."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {feedback}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {profiles.map((profile) => {
            const isActive = profile.id === currentProfileId;
            const isSelecting = selectingProfileId === profile.id;
            const canEdit = canEditProfile(profile);
            const canDelete = canDeleteProfile(profile);
            const showActions = canEdit || canDelete;

            return (
              <Card
                key={profile.id}
                className={`cursor-pointer transition-all hover:scale-105 relative ${
                  isActive ? "ring-2 ring-primary-500 dark:ring-primary-400 ring-offset-2 dark:ring-offset-slate-900 shadow-lg" : ""
                } ${isSelecting ? "opacity-75" : ""}`}
                onClick={() => !isSelecting && handleProfileClick(profile)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    {isActive && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-primary-500 dark:bg-primary-400 text-white">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Actuel
                        </Badge>
                      </div>
                    )}

                    {showActions && (
                      <div className="absolute top-3 right-3 flex gap-1 z-10">
                        {canEdit && (
                          <button
                            onClick={(e) => handleEditProfile(e, profile)}
                            className="p-1.5 rounded-md bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-700 shadow-md transition-colors z-20"
                            title="Modifier le profil"
                            aria-label="Modifier le profil"
                          >
                            <Edit2 className="h-4 w-4 text-gray-600 dark:text-slate-300" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={(e) => handleDeleteProfile(e, profile)}
                            disabled={deletingProfileId === profile.id}
                            className="p-1.5 rounded-md bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 border border-gray-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-20"
                            title="Supprimer le profil"
                            aria-label="Supprimer le profil"
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 overflow-hidden mb-4">
                      {profile.avatarUrl ? (
                        <img
                          src={profilePhotosService.getProfilePhotoUrl(profile.avatarUrl) || ""}
                          alt={`Photo de ${profile.name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-semibold text-primary">
                            {profile.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1 whitespace-nowrap">
                      {profile.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getRoleBadgeColor(profile.role)}>
                        {getRoleLabel(profile.role)}
                      </Badge>
                      {profile.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Par défaut
                        </Badge>
                      )}
                    </div>

                    {!profile.isActive && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Inactif
                      </Badge>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      disabled={!profile.isActive || isSelecting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProfileClick(profile);
                      }}
                    >
                      {isSelecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        <>
                          Sélectionner
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card
            className="cursor-pointer transition-all hover:scale-105 border-2 border-dashed border-gray-300 dark:border-slate-700"
            onClick={() => setShowCreateDialog(true)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[250px] sm:min-h-[280px]">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center mb-3 sm:mb-4">
                  <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">
                  Créer un profil
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                  Ajoutez un nouveau profil utilisateur
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">
            Vous pouvez changer de profil à tout moment depuis le menu utilisateur
          </p>
        </div>
      </div>

      {/* Modale de création de profil */}
      <ProfileCreateModal
        isOpen={showCreateDialog}
        onClose={handleCloseCreateDialog}
        userRole={user?.role}
        allowedRoles={[user?.role || 'STAFF'] as UserRole[]}
        userHotelId={user?.hotelId || null}
        currentUserId={user?.id}
        onProfilesRefresh={refreshProfiles}
        requireDefaultProfile={hasDefaultProfile === false}
      />

      {/* Modale d'édition de profil */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProfile(null);
          setFeedback(null);
        }}
        profile={editingProfile}
        profiles={profiles}
        checkPermission={checkPermission}
        onProfilesRefresh={refreshProfiles}
        requireDefaultProfile={hasDefaultProfile === false && editingProfile?.isDefault === false}
      />

      {/* Modale de suppression de profil */}
      <ProfileDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProfile(null);
          setDeleteModalError(null);
        }}
        profile={deletingProfile}
        onConfirm={handleDeleteConfirm}
        isDeleting={deletingProfileId !== null}
        error={deleteModalError}
      />

      {/* Modale de saisie de PIN */}
      {profileRequiringPin && (
        <ProfilePinModal
          isOpen={!!profileRequiringPin}
          onClose={() => {
            setProfileRequiringPin(null);
            setPinError(null);
          }}
          onConfirm={handlePinSubmit}
          profileName={profileRequiringPin.name}
          error={pinError}
        />
      )}
    </div>
  );
}
