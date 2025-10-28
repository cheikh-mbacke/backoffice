// src/pages/Profiles.tsx
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useQueryClient } from "@tanstack/react-query";
import { profilesService } from "@/services/profiles.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User as UserIcon,
  Plus,
  Edit,
  Trash2,
  Check,
  Star,
  Sparkles,
} from "lucide-react";
import { Profile } from "@/types";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { profilePhotosService } from "@/services/profilePhotos.service";
import { cn } from "@/lib/utils";

export default function ProfilesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { profiles, isLoading, refetch: refetchProfiles } = useUserProfiles();

  // Utiliser le hook useProfiles pour les mutations
  const { updateProfile, isUpdating } = useProfiles();

  // États pour les opérations CRUD
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Utiliser le hook useAuth pour la sélection de profil
  const { selectProfile, isSelectingProfile } = useAuth();

  // Fonction pour créer un profil
  const createProfile = async (data: any) => {
    try {
      setIsCreating(true);
      const result = await profilesService.create(data);
      await refetchProfiles();
      return result; // Retourner le résultat
    } catch (error) {
      // Propager l'erreur pour qu'elle soit gérée par l'appelant
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // Fonction pour supprimer un profil
  const deleteProfile = async (id: string) => {
    try {
      setIsDeleting(true);
      await profilesService.delete(id);
      await refetchProfiles();
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  // États pour les dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // États pour le formulaire
  const [formName, setFormName] = useState("");

  // Synchroniser selectedProfile avec les données mises à jour
  useEffect(() => {
    if (selectedProfile && profiles.length > 0) {
      const updatedProfile = profiles.find((p) => p.id === selectedProfile.id);
      if (updatedProfile) {
        setSelectedProfile(updatedProfile);
      }
    }
  }, [profiles, selectedProfile]);

  const resetForm = () => {
    setFormName("");
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("Le nom du profil est requis");
      return;
    }

    try {
      // Pour les SUPER_ADMIN, on doit permettre la sélection d'un hôtel
      // Pour les autres rôles, utiliser l'hôtel de l'utilisateur
      const profileData: any = {
        name: formName.trim(),
        role: user?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "STAFF", // Utiliser le rôle de l'utilisateur pour SUPER_ADMIN
        isDefault: false, // Nouveau profil n'est jamais par défaut
        isActive: true, // Nouveau profil est toujours actif
        userId: user?.id || "",
      };

      // Ajouter hotelId seulement si l'utilisateur en a un
      if (user?.hotelId) {
        profileData.hotelId = user.hotelId;
      } else if (user?.role === "SUPER_ADMIN") {
        // Pour les SUPER_ADMIN sans hôtel, créer un profil SUPER_ADMIN (pas besoin d'hôtel)
        profileData.role = "SUPER_ADMIN";
        profileData.hotelId = null; // SUPER_ADMIN peut avoir hotelId null
      }

      const result = await createProfile(profileData);

      // Afficher le message de succès
      if (result?.message) {
        toast.success(result.message);
      } else {
        toast.success("Profil créé avec succès");
      }

      setShowCreateDialog(false);
      resetForm();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { errorMessage?: string } };
      };
      toast.error(
        axiosError.response?.data?.errorMessage || "Erreur lors de la création"
      );
    }
  };

  const handleEdit = async () => {
    if (!selectedProfile) return;

    if (!formName.trim()) {
      toast.error("Le nom du profil est requis");
      return;
    }

    try {
      updateProfile({
        id: selectedProfile.id,
        data: {
          name: formName.trim(),
          // Les autres champs (rôle, hôtel, statuts) ne peuvent pas être modifiés
        },
      });
      setShowEditDialog(false);
      setSelectedProfile(null);
      resetForm();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { errorMessage?: string } };
      };
      toast.error(
        axiosError.response?.data?.errorMessage ||
          "Erreur lors de la modification"
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedProfile) return;

    try {
      await deleteProfile(selectedProfile.id);
      setShowDeleteDialog(false);
      setSelectedProfile(null);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { errorMessage?: string } };
      };
      toast.error(
        axiosError.response?.data?.errorMessage ||
          "Erreur lors de la suppression"
      );
    }
  };

  const handleSelectProfile = async (profileId: string) => {
    try {
      // Utiliser la fonction synchronisée du hook
      await selectProfile(profileId);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { errorMessage?: string } };
      };
      toast.error(
        axiosError.response?.data?.errorMessage ||
          "Erreur lors de la sélection du profil"
      );
    }
  };

  const openEditDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setFormName(profile.name);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <>
        <Header title="Mes Profils" />
        <div className="p-4 sm:p-6 flex items-center justify-center h-64">
          <p className="text-sm sm:text-base text-muted-foreground">
            Chargement des profils...
          </p>
        </div>
      </>
    );
  }

  // Séparer le profil actuel des autres
  const currentProfile = profiles?.find((p) => p.id === user?.currentProfileId);
  const otherProfiles = profiles?.filter(
    (p) => p.id !== user?.currentProfileId
  );

  return (
    <>
      <Header title="Mes Profils" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Bouton pour créer un nouveau profil */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Nouveau profil
          </Button>
        </div>

        {/* Profil actuel */}
        {currentProfile && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold">
                Profil actuel
              </h2>
            </div>

            <Card className="transition-all hover:shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Photo de profil */}
                  <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 shadow-sm">
                      {(() => {
                        // Utiliser directement l'avatarUrl du profil actuel
                        const photoUrl =
                          profilePhotosService.getProfilePhotoUrl(
                            currentProfile.avatarUrl
                          );

                        return photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={`Photo de ${currentProfile.name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-primary/40" />
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Informations du profil */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="space-y-2 flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 justify-center sm:justify-start flex-wrap">
                          <h3 className="text-lg font-semibold truncate text-center sm:text-left">
                            {currentProfile.name}
                          </h3>
                          {currentProfile.isDefault && (
                            <Badge
                              variant="secondary"
                              className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              size="sm"
                            >
                              <Star className="h-3 w-3 fill-current" />
                              Par défaut
                            </Badge>
                          )}
                        </div>

                        {currentProfile.hotel && (
                          <div className="text-sm text-muted-foreground">
                            <span className="truncate">
                              {currentProfile.hotel.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 items-center w-full sm:w-auto justify-center sm:justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(currentProfile)}
                          className="gap-2 w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sm:hidden">Modifier</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Autres profils */}
        {otherProfiles && otherProfiles.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold">
                Autres profils
              </h2>
              <Badge variant="secondary" size="sm">
                {otherProfiles.length}
              </Badge>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {otherProfiles.map((profile) => (
                <Card
                  key={profile.id}
                  className={cn(
                    "transition-all hover:shadow-md",
                    !profile.isActive && "opacity-60"
                  )}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Photo de profil */}
                      <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 shadow-sm">
                          {(() => {
                            // Utiliser directement l'avatarUrl du profil
                            const photoUrl =
                              profilePhotosService.getProfilePhotoUrl(
                                profile.avatarUrl
                              );

                            return photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={`Photo de ${profile.name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <UserIcon className="w-8 h-8 text-primary/40" />
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Informations du profil */}
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="space-y-2 flex-1 min-w-0 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 justify-center sm:justify-start flex-wrap">
                              <h3 className="text-lg font-semibold truncate text-center sm:text-left">
                                {profile.name}
                              </h3>
                              {profile.isDefault && (
                                <Badge
                                  variant="secondary"
                                  className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  size="sm"
                                >
                                  <Star className="h-3 w-3 fill-current" />
                                  Par défaut
                                </Badge>
                              )}
                            </div>

                            {profile.hotel && (
                              <div className="text-sm text-muted-foreground">
                                <span className="truncate">
                                  {profile.hotel.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 items-center w-full sm:w-auto justify-center sm:justify-start">
                            {profile.isActive && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleSelectProfile(profile.id)}
                                disabled={isSelectingProfile}
                                className="gap-2 shadow-sm w-full sm:w-auto"
                              >
                                {isSelectingProfile ? (
                                  "Sélection..."
                                ) : (
                                  <>
                                    <Check className="h-4 w-4" />
                                    <span>Sélectionner</span>
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(profile)}
                              className="gap-2 w-full sm:w-auto"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sm:hidden">Modifier</span>
                            </Button>
                            {!profile.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(profile)}
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sm:hidden">Supprimer</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun profil */}
        {!profiles ||
          (profiles.length === 0 && (
            <Card className="border-dashed border-2">
              <CardContent className="p-6 sm:p-12 md:p-16 text-center">
                <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold">
                      Aucun profil
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Créez votre premier profil pour commencer à utiliser
                      l'application. Les profils vous permettent de gérer
                      différentes identités de travail.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="gap-2 w-full sm:w-auto"
                    size="lg"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    Créer mon premier profil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Dialog création de profil */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Créer un nouveau profil
              </DialogTitle>
              <DialogDescription className="text-sm">
                Créez une nouvelle identité de travail avec un rôle et un hôtel
                spécifiques
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-sm">
                  Nom du profil *
                </Label>
                <Input
                  id="create-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Mohamed - Réception"
                  className="text-sm"
                />
              </div>

              {/* Seul le nom peut être défini lors de la création */}
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                className="w-full sm:w-auto"
                size="sm"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full sm:w-auto"
                size="sm"
              >
                {isCreating ? "Création..." : "Créer le profil"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog modification de profil */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Modifier le profil
              </DialogTitle>
              <DialogDescription className="text-sm">
                Modifiez les informations et la photo de ce profil
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6 py-4">
              {/* Photo de profil */}
              {selectedProfile && (
                <div className="flex justify-center pb-4 border-b">
                  <ProfilePhotoUpload
                    profileId={selectedProfile.id}
                    currentAvatarUrl={selectedProfile.avatarUrl}
                    profileName={selectedProfile.name}
                    onPhotoUpdated={async (avatarUrl) => {
                      // Mettre à jour localement le profil sélectionné
                      setSelectedProfile((prev) =>
                        prev ? { ...prev, avatarUrl: avatarUrl || undefined } : null
                      );

                      // Recharger les données des profils pour mettre à jour l'avatarUrl
                      await refetchProfiles();

                      // Si c'est le profil actuel, mettre à jour l'utilisateur dans le contexte
                      if (selectedProfile.id === user?.currentProfileId) {
                        queryClient.setQueryData(
                          ["currentUser"],
                          (oldUser: any) => ({
                            ...oldUser,
                            currentProfileAvatarUrl: avatarUrl,
                          })
                        );

                        // Invalider aussi le cache pour forcer le rechargement
                        queryClient.invalidateQueries({
                          queryKey: ["currentUser"],
                        });
                      }
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm">
                  Nom du profil *
                </Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Mohamed - Réception"
                  className="text-sm"
                />
              </div>

              {/* Les champs Rôle et Hôtel ne peuvent pas être modifiés - masqués pour tous les profils */}

              {/* Les options de statut ne peuvent pas être modifiées - masquées pour tous les profils */}
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedProfile(null);
                  resetForm();
                }}
                className="w-full sm:w-auto"
                size="sm"
              >
                Annuler
              </Button>
              <Button
                onClick={handleEdit}
                disabled={isUpdating}
                className="w-full sm:w-auto"
                size="sm"
              >
                {isUpdating ? "Modification..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog suppression de profil */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-destructive text-lg sm:text-xl">
                Supprimer le profil
              </DialogTitle>
              <DialogDescription className="text-sm">
                Êtes-vous sûr de vouloir supprimer le profil "
                {selectedProfile?.name}" ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedProfile(null);
                }}
                className="w-full sm:w-auto"
                size="sm"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto"
                size="sm"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
