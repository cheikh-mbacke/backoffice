// src/components/auth/ProfileSelectionDialog.tsx
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { authService } from "@/services/auth.service";
import { profilesService } from "@/services/profiles.service";
import { Profile } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  User as UserIcon,
  Shield,
  Building2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { profilePhotosService } from "@/services/profilePhotos.service";

interface ProfileSelectionDialogProps {
  open: boolean;
  onProfileSelected: () => void;
  onOpenChange?: (open: boolean) => void; // Nouveau: callback pour fermer la modale
  requireDefault?: boolean; // Nouveau: indique si on exige un profil par défaut
}

export function ProfileSelectionDialog({
  open,
  onProfileSelected,
  onOpenChange,
  requireDefault = false,
}: ProfileSelectionDialogProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [hasDefaultProfile, setHasDefaultProfile] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [profileName, setProfileName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      loadProfiles();
    }
  }, [open]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const { profiles: availableProfiles, hasDefaultProfile: hasDefault } =
        await authService.getAvailableProfiles();
      setProfiles(availableProfiles);
      setHasDefaultProfile(hasDefault);

      // Si aucun profil n'existe et qu'on exige un profil par défaut, afficher le formulaire
      if (availableProfiles.length === 0 && requireDefault) {
        setShowCreateForm(true);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des profils");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profileId: string) => {
    try {
      setSelecting(profileId);
      const { user } = await authService.selectProfile(profileId);

      // Mettre à jour le cache de l'utilisateur avec la bonne clé
      queryClient.setQueryData(queryKeys.auth.currentUser, user);

      toast.success(
        `Profil "${user.currentProfileName || "sélectionné"}" sélectionné`
      );
      onProfileSelected();
      // Fermer la modale après sélection
      onOpenChange?.(false);
    } catch (error) {
      toast.error("Erreur lors de la sélection du profil");
    } finally {
      setSelecting(null);
    }
  };

  const handleCreateProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Veuillez saisir un nom de profil");
      return;
    }

    try {
      setCreating(true);

      // Récupérer l'utilisateur actuel pour obtenir son ID et hotelId
      let currentUser = queryClient.getQueryData<{
        id: string;
        hotelId: string | null;
        role: string;
      }>(queryKeys.auth.currentUser);

      // Si l'utilisateur n'est pas dans le cache, essayer de le récupérer depuis l'authService
      if (!currentUser) {
        try {
          const userData = await authService.getCurrentUser();
          currentUser = {
            id: userData.id,
            hotelId: userData.hotelId,
            role: userData.role,
          };
        } catch (error) {
          toast.error(
            "Impossible de récupérer les informations utilisateur - Veuillez vous reconnecter"
          );
          return;
        }
      }

      if (!currentUser) {
        toast.error("Utilisateur non trouvé - Veuillez vous reconnecter");
        return;
      }

      // Créer le profil par défaut
      const profileData: any = {
        name: profileName.trim(),
        role: currentUser.role,
        isDefault: true,
        userId: currentUser.id,
      };

      // Ajouter hotelId seulement si l'utilisateur en a un
      if (currentUser.hotelId) {
        profileData.hotelId = currentUser.hotelId;
      } else if (currentUser.role === "SUPER_ADMIN") {
        // Pour les SUPER_ADMIN sans hôtel, créer un profil SUPER_ADMIN (pas besoin d'hôtel)
        profileData.role = "SUPER_ADMIN";
        profileData.hotelId = null; // SUPER_ADMIN peut avoir hotelId null
      }

      const response = await profilesService.create(profileData);

      toast.success(response.message);

      // Recharger les profils
      await loadProfiles();
      setShowCreateForm(false);
      setProfileName("");
      // Fermer la modale après création
      onOpenChange?.(false);
    } catch (error) {
      toast.error("Erreur lors de la création du profil");
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "STAFF":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      case "STAFF":
        return "Staff";
      default:
        return "Inconnu";
    }
  };

  // Fonction pour gérer la fermeture de la modale
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Si on essaie de fermer la modale
      if (requireDefault && (!hasDefaultProfile || profiles.length === 0)) {
        // Empêcher la fermeture si on exige un profil par défaut et qu'il n'y en a pas
        return;
      }
    }
    onOpenChange?.(newOpen);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sélection du profil</DialogTitle>
            <DialogDescription>Chargement de vos profils...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Formulaire de création de profil
  if (showCreateForm) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-[500px]"
          onEscapeKeyDown={(e) => {
            if (requireDefault) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            if (requireDefault) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Créer votre profil par défaut
            </DialogTitle>
            <DialogDescription>
              Vous devez créer un profil par défaut pour continuer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Nom du profil</Label>
              <Input
                id="profileName"
                placeholder="Ex: Mon profil principal"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateProfile();
                  }
                }}
                disabled={creating}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Ce profil sera votre profil par défaut
              </p>
            </div>

            <Button
              onClick={handleCreateProfile}
              disabled={creating || !profileName.trim()}
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer le profil
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[600px]"
        onEscapeKeyDown={(e) => {
          // Empêcher la fermeture si requireDefault=true et pas de profil par défaut
          if (requireDefault && (!hasDefaultProfile || profiles.length === 0)) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          // Empêcher la fermeture si requireDefault=true et pas de profil par défaut
          if (requireDefault && (!hasDefaultProfile || profiles.length === 0)) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Sélectionnez votre profil
          </DialogTitle>
          <DialogDescription>
            Choisissez le profil avec lequel vous souhaitez travailler
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Message d'avertissement si pas de profil par défaut */}
          {!hasDefaultProfile && profiles.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                ⚠️ Aucun profil par défaut défini. Veuillez en créer un.
              </p>
            </div>
          )}

          {profiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Aucun profil disponible
              </p>
              <Button onClick={() => setShowCreateForm(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Créer un profil
              </Button>
            </div>
          ) : (
            profiles.map((profile) => (
              <Card
                key={profile.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectProfile(profile.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                          {profile.avatarUrl ? (
                            <img
                              src={
                                profilePhotosService.getProfilePhotoUrl(
                                  profile.avatarUrl
                                ) || ""
                              }
                              alt={`Photo de ${profile.name}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const nextElement = e.currentTarget
                                  .nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              profile.avatarUrl ? "hidden" : "flex"
                            }`}
                          >
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">
                            {profile.name}
                          </h3>
                          {profile.isDefault && (
                            <span className="text-xs text-muted-foreground">
                              Profil par défaut
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getRoleBadgeColor(profile.role)}>
                          <Shield className="h-3 w-3 mr-1" />
                          {getRoleLabel(profile.role)}
                        </Badge>

                        {profile.hotel && (
                          <Badge variant="outline">
                            <Building2 className="h-3 w-3 mr-1" />
                            {profile.hotel.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      disabled={selecting === profile.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProfile(profile.id);
                      }}
                    >
                      {selecting === profile.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sélection...
                        </>
                      ) : (
                        "Sélectionner"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Bouton pour créer un nouveau profil */}
          {profiles.length > 0 && (
            <div className="pt-2 border-t">
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un nouveau profil
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
