// src/components/profile/ProfilePhotoUpload.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, Camera, X, Loader2, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { profilePhotosService } from "@/services/profilePhotos.service";
import {
  useProfilePhotoUpload,
  useProfilePhotoDelete,
} from "@/hooks/useProfilePhoto";

interface ProfilePhotoUploadProps {
  profileId: string;
  currentAvatarUrl?: string;
  profileName: string;
  onPhotoUpdated: (avatarUrl: string | null) => void;
  className?: string;
}

export function ProfilePhotoUpload({
  profileId,
  currentAvatarUrl,
  profileName,
  onPhotoUpdated,
  className,
}: ProfilePhotoUploadProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(
    currentAvatarUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utiliser les hooks centralisés pour la gestion des mutations
  const uploadMutation = useProfilePhotoUpload(profileId, (avatarUrl) => {
    setLocalAvatarUrl(avatarUrl); // Mettre à jour l'état local immédiatement
    onPhotoUpdated(avatarUrl);
    setShowUploadDialog(false);
  });

  const deleteMutation = useProfilePhotoDelete(profileId, () => {
    setLocalAvatarUrl(null); // Mettre à jour l'état local immédiatement
    onPhotoUpdated(null);
  });

  // Synchroniser l'état local avec les props quand elles changent
  useEffect(() => {
    setLocalAvatarUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const handleFileSelect = async (file: File) => {
    // Valider le fichier
    const validation = profilePhotosService.validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      // Redimensionner l'image avant upload
      const resizedFile = await profilePhotosService.resizeImage(
        file,
        300,
        300
      );

      // Utiliser la mutation centralisée
      await uploadMutation.mutateAsync(resizedFile);
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDeletePhoto = async () => {
    try {
      // Utiliser la mutation centralisée
      await deleteMutation.mutateAsync();
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const getProfilePhotoUrl = () => {
    const url = profilePhotosService.getProfilePhotoUrl(localAvatarUrl || undefined);
    return url;
  };

  const photoUrl = getProfilePhotoUrl();

  return (
    <>
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        {/* Photo de profil */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`Photo de ${profileName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Badge de statut */}
          {photoUrl && (
            <Badge
              variant="secondary"
              className="absolute -bottom-1 -right-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              <Camera className="w-3 h-3 mr-1" />
              Photo
            </Badge>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowUploadDialog(true)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {photoUrl ? "Changer" : "Ajouter"}
          </Button>

          {photoUrl && (
            <Button
              onClick={handleDeletePhoto}
              variant="outline"
              size="sm"
              disabled={deleteMutation.isPending}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Nom du profil */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {photoUrl ? "Photo de profil définie" : "Aucune photo"}
          </p>
        </div>
      </div>

      {/* Dialog d'upload */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              {photoUrl
                ? "Changer la photo de profil"
                : "Ajouter une photo de profil"}
            </DialogTitle>
            <DialogDescription className="text-base">
              Sélectionnez une image pour votre profil. <br />
              <span className="font-medium">Formats acceptés :</span> JPG, PNG,
              WebP (max 2MB)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Zone de drop */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                dragOver
                  ? "border-primary bg-primary/10 scale-105"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-primary/5",
                uploadMutation.isPending && "opacity-50 pointer-events-none"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() =>
                !uploadMutation.isPending && fileInputRef.current?.click()
              }
            >
              {uploadMutation.isPending ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium">Upload en cours...</p>
                    <p className="text-sm text-muted-foreground">
                      Redimensionnement et optimisation de l'image
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-semibold">
                      Glissez-déposez votre image ici
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou cliquez n'importe où dans cette zone
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="px-2 py-1 rounded bg-muted">JPG</div>
                    <div className="px-2 py-1 rounded bg-muted">PNG</div>
                    <div className="px-2 py-1 rounded bg-muted">WebP</div>
                    <div className="px-2 py-1 rounded bg-muted">Max 2MB</div>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="flex-1 gap-2"
                size="lg"
              >
                <Camera className="w-5 h-5" />
                Parcourir les fichiers
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
                disabled={uploadMutation.isPending}
                size="lg"
              >
                Annuler
              </Button>
            </div>

            {/* Input file caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
