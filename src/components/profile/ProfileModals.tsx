// src/components/profile/ProfileModals.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  Upload,
  X,
  Lock,
  LockOpen,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AvatarWithInitials } from '@/components/ui/avatar';
import { profilesService } from '@/services/profiles.service';
import { profilePhotosService } from '@/services/profilePhotos.service';
import { Profile, UserRole } from '@/types';
import { getRoleLabel } from '@/lib/utils';
import { toast } from 'sonner';

// Interface de base pour toutes les modales
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfilesRefresh?: () => Promise<Profile[] | void>;
}

// ==================== MODALE DE CRÉATION ====================
interface ProfileCreateModalProps extends BaseModalProps {
  userRole?: UserRole;
  allowedRoles: UserRole[];
  userHotelId?: string | null;
  userHotelName?: string | null;
  currentUserId?: string;
  requireDefaultProfile?: boolean;
}

interface CreateFormData {
  name: string;
  role: UserRole;
  isActive?: boolean;
  isDefault?: boolean;
  email?: string | null;
}

export const ProfileCreateModal: React.FC<ProfileCreateModalProps> = ({
  isOpen,
  onClose,
  userRole,
  allowedRoles,
  userHotelId,
  userHotelName,
  currentUserId,
  onProfilesRefresh,
  requireDefaultProfile = false,
}) => {
  const defaultRole = allowedRoles[0] || (userRole as UserRole) || 'STAFF';
  const [formData, setFormData] = useState<CreateFormData>({
    name: '',
    role: defaultRole,
    isActive: requireDefaultProfile ? true : (userRole !== 'STAFF' ? true : undefined),
    isDefault: requireDefaultProfile ? true : (userRole !== 'STAFF' ? false : undefined),
    email: null,
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fermeture automatique des messages d'erreur après 5 secondes
  useEffect(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    if (errors.submit) {
      errorTimeoutRef.current = setTimeout(() => {
        setErrors((prev) => ({ ...prev, submit: undefined }));
      }, 5000);
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [errors.submit]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        role: defaultRole,
        isActive: requireDefaultProfile ? true : (userRole !== 'STAFF' ? true : undefined),
        isDefault: requireDefaultProfile ? true : (userRole !== 'STAFF' ? false : undefined),
        email: null,
      });
      setErrors({});
    }
  }, [isOpen, defaultRole, userRole, requireDefaultProfile]);

  const closeModal = () => {
    if (requireDefaultProfile) {
      setErrors({
        submit: 'Vous devez créer un profil par défaut pour continuer. Cette action est obligatoire.',
      });
      return;
    }
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Le nom ne peut pas dépasser 50 caractères';
    }

    if (formData.email !== null && formData.email !== undefined && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Format d\'email invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: any = {
        name: formData.name.trim(),
        role: formData.role,
        email: formData.email && formData.email.trim() !== '' ? formData.email.trim() : null,
      };

      if (userRole !== 'STAFF') {
        payload.isActive = formData.isActive;
        payload.isDefault = formData.isDefault;
      } else if (requireDefaultProfile) {
        payload.isActive = true;
        payload.isDefault = true;
      }

      if (formData.role === 'MANAGER' || formData.role === 'STAFF') {
        if (!userHotelId) {
          setErrors({
            submit: "Impossible de déterminer l'hôtel. Veuillez sélectionner un profil.",
          });
          setIsSubmitting(false);
          return;
        }
        payload.hotelId = userHotelId;
      } else {
        payload.hotelId = null;
      }

      await profilesService.create(payload);
      await onProfilesRefresh?.();
      
      window.dispatchEvent(new CustomEvent('profile-changed', { 
        detail: { 
          action: 'profile-create',
          timestamp: Date.now()
        } 
      }));
      
      toast.success('Profil créé avec succès');

      if (requireDefaultProfile) {
        setErrors({});
        setIsSubmitting(false);
        onClose();
      } else {
        closeModal();
      }
    } catch (error: any) {
      setErrors({
        submit:
          error.response?.data?.errorMessage ||
          error.message ||
          'Erreur lors de la création du profil',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px]"
        onEscapeKeyDown={(e) => {
          if (requireDefaultProfile) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (requireDefaultProfile) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {requireDefaultProfile ? "Créer un profil par défaut" : "Créer un nouveau profil"}
          </DialogTitle>
          <DialogDescription>
            {requireDefaultProfile 
              ? "Vous devez créer un profil par défaut pour continuer. Cette action est obligatoire." 
              : "Ajoutez un nouveau profil utilisateur"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {requireDefaultProfile && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-md text-sm">
              <p className="font-medium">Profil par défaut requis</p>
              <p className="text-sm mt-1">
                Vous devez créer un profil par défaut pour continuer. Cette action est obligatoire.
              </p>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="create-name">Nom du profil *</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              placeholder="Ex: Réceptionniste Matin"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-role">Rôle</Label>
            <Input
              id="create-role"
              value={getRoleLabel(formData.role)}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Le rôle du profil est défini par le compte utilisateur
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">Email (optionnel)</Label>
            <Input
              id="create-email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value || null });
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              placeholder="exemple@hotel.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Email spécifique pour ce profil. Si non renseigné, l'email de l'utilisateur sera utilisé pour les notifications.
            </p>
          </div>

          {userHotelId && (
            <div className="space-y-2">
              <Label>Hôtel</Label>
              <Input value={userHotelName || 'Votre hôtel'} disabled />
              <p className="text-xs text-muted-foreground">
                Ce profil sera associé à votre hôtel
              </p>
            </div>
          )}

          {userRole !== 'STAFF' ? (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-is-active"
                  checked={formData.isActive || false}
                  onCheckedChange={(checked) => {
                    setFormData({
                      ...formData,
                      isActive: checked as boolean,
                      isDefault: checked ? (requireDefaultProfile ? true : formData.isDefault) : false,
                    });
                  }}
                  disabled={requireDefaultProfile || isSubmitting}
                />
                <Label htmlFor="create-is-active" className="font-normal cursor-pointer">
                  Profil actif
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-is-default"
                  checked={formData.isDefault || false}
                  onCheckedChange={(checked) => {
                    if (requireDefaultProfile) return;
                    setFormData({
                      ...formData,
                      isDefault: checked as boolean,
                      isActive: checked ? true : formData.isActive,
                    });
                  }}
                  disabled={!formData.isActive || requireDefaultProfile || isSubmitting}
                />
                <Label htmlFor="create-is-default" className="font-normal cursor-pointer">
                  Définir comme profil par défaut
                </Label>
              </div>
            </>
          ) : requireDefaultProfile ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-md text-sm">
              <p className="font-medium">Ce profil sera automatiquement actif et défini comme profil par défaut.</p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          {!requireDefaultProfile && (
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
              Annuler
            </Button>
          )}
          <div className="flex flex-col items-end gap-2">
            {!formData.name.trim() && (
              <p className="text-xs text-muted-foreground">
                Veuillez saisir un nom de profil pour continuer
              </p>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.name.trim()}
              title={!formData.name.trim() ? 'Veuillez saisir un nom de profil' : ''}
            >
              {isSubmitting ? 'Création...' : requireDefaultProfile ? 'Créer le profil par défaut' : 'Créer le profil'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==================== MODALE D'ÉDITION ====================
interface ProfileEditModalProps extends BaseModalProps {
  profile: Profile | null;
  profiles: Profile[];
  checkPermission: (profile: Profile, action: string) => boolean;
  requireDefaultProfile?: boolean;
}

interface EditFormData {
  name: string;
  role: UserRole;
  isActive: boolean;
  isDefault: boolean;
  replacementProfileId?: string;
  email?: string | null;
}

interface EditFormErrors {
  name?: string;
  email?: string;
  replacementProfileId?: string;
  submit?: string;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  profiles,
  checkPermission,
  onProfilesRefresh,
  requireDefaultProfile = false,
}) => {
  const [formData, setFormData] = useState<EditFormData | null>(null);
  const [errors, setErrors] = useState<EditFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [originalIsDefault, setOriginalIsDefault] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSetPinModalOpen, setIsSetPinModalOpen] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [lastSubmittedValues, setLastSubmittedValues] = useState<{
    name: string;
    email: string | null;
    isActive: boolean;
    isDefault: boolean;
    avatarUrl: string | null;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const successMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && profile) {
      const avatarUrl = profilePhotosService.getProfilePhotoUrl(profile.avatarUrl) || profile.avatarUrl || null;
      setFormData({
        name: profile.name,
        role: profile.role,
        isActive: profile.isActive,
        isDefault: requireDefaultProfile ? true : profile.isDefault,
        replacementProfileId: undefined,
        email: profile.email || null,
      });
      setOriginalIsDefault(profile.isDefault);
      setAvatarPreview(avatarUrl);
      setErrors({});
      setHasPin(!!profile.pin_hash);
      setLastSubmittedValues({
        name: profile.name,
        email: profile.email || null,
        isActive: profile.isActive,
        isDefault: requireDefaultProfile ? true : profile.isDefault,
        avatarUrl,
      });
    } else if (!isOpen) {
      setFormData(null);
      setErrors({});
      setAvatarPreview(null);
      setOriginalIsDefault(false);
      setSuccessMessage(null);
      setLastSubmittedValues(null);
    }
  }, [isOpen, profile?.id, requireDefaultProfile]);

  useEffect(() => {
    if (successMessageTimeoutRef.current) {
      clearTimeout(successMessageTimeoutRef.current);
    }
    if (errorMessageTimeoutRef.current) {
      clearTimeout(errorMessageTimeoutRef.current);
    }

    if (successMessage) {
      successMessageTimeoutRef.current = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }

    return () => {
      if (successMessageTimeoutRef.current) {
        clearTimeout(successMessageTimeoutRef.current);
      }
      if (errorMessageTimeoutRef.current) {
        clearTimeout(errorMessageTimeoutRef.current);
      }
    };
  }, [successMessage]);

  useEffect(() => {
    if (errorMessageTimeoutRef.current) {
      clearTimeout(errorMessageTimeoutRef.current);
    }

    if (errors.submit) {
      errorMessageTimeoutRef.current = setTimeout(() => {
        setErrors((prev) => ({ ...prev, submit: undefined }));
      }, 5000);
    }

    return () => {
      if (errorMessageTimeoutRef.current) {
        clearTimeout(errorMessageTimeoutRef.current);
      }
    };
  }, [errors.submit]);

  const replacementOptions = useMemo(() => {
    if (!profile) return [];
    return profiles
      .filter((p) => p.id !== profile.id && p.isActive)
      .map((p) => ({
        value: p.id,
        label: `${p.name} (${getRoleLabel(p.role)})`,
      }));
  }, [profiles, profile?.id]);

  const hasChanges = useMemo(() => {
    if (!profile || !formData) return false;
    
    const referenceValues = lastSubmittedValues || {
      name: profile.name,
      email: profile.email || null,
      isActive: profile.isActive,
      isDefault: profile.isDefault,
      avatarUrl: profilePhotosService.getProfilePhotoUrl(profile.avatarUrl) || profile.avatarUrl || null,
    };
    
    const nameChanged = formData.name.trim() !== referenceValues.name;
    const emailChanged = (formData.email || null) !== referenceValues.email;
    const isActiveChanged = formData.isActive !== referenceValues.isActive;
    const isDefaultChanged = formData.isDefault !== referenceValues.isDefault;
    const avatarChanged = avatarPreview !== referenceValues.avatarUrl;
    
    return nameChanged || emailChanged || isActiveChanged || isDefaultChanged || avatarChanged;
  }, [profile, formData, avatarPreview, lastSubmittedValues]);

  const closeModal = () => {
    if (requireDefaultProfile && formData && !formData.isDefault && !successMessage) {
      setErrors({
        submit: 'Vous devez définir ce profil comme profil par défaut pour continuer. Cette action est obligatoire.',
      });
      return;
    }
    setErrors({});
    setIsSubmitting(false);
    setIsUploadingAvatar(false);
    setAvatarPreview(null);
    setFormData(null);
    setOriginalIsDefault(false);
    setSuccessMessage(null);
    setLastSubmittedValues(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!profile || !formData) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <div className="py-10 text-center text-sm text-muted-foreground">
            Chargement du profil…
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async () => {
    const newErrors: EditFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Le nom ne peut pas dépasser 50 caractères';
    }

    if (formData.email !== null && formData.email !== undefined && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Format d\'email invalide';
      }
    }

    if (!checkPermission(profile, 'edit')) {
      newErrors.submit = 'Vous n\'avez pas la permission de modifier ce profil';
    }

    if (formData.isActive !== profile.isActive && !checkPermission(profile, 'activate')) {
      newErrors.submit = 'Vous n\'avez pas la permission d\'activer ou désactiver ce profil';
    }

    if (formData.isDefault !== profile.isDefault && !checkPermission(profile, 'setDefault')) {
      newErrors.submit = 'Vous n\'avez pas la permission de définir ce profil par défaut';
    }

    if (originalIsDefault && !formData.isDefault && !formData.replacementProfileId) {
      newErrors.replacementProfileId = 'Vous devez sélectionner un profil de remplacement';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email && formData.email.trim() !== '' ? formData.email.trim() : null,
      };

      if (checkPermission(profile, 'activate')) {
        payload.isActive = formData.isActive;
      }

      if (checkPermission(profile, 'setDefault')) {
        payload.isDefault = formData.isDefault;
        if (originalIsDefault && !formData.isDefault && formData.replacementProfileId) {
          payload.replacementProfileId = formData.replacementProfileId;
        }
      }

      const { profile: updatedProfile } = await profilesService.update(profile.id, payload);
      setOriginalIsDefault(updatedProfile.isDefault);
      setFormData((current) =>
        current
          ? {
              ...current,
              name: updatedProfile.name,
              email: updatedProfile.email ?? null,
              isActive: updatedProfile.isActive,
              isDefault: updatedProfile.isDefault,
            }
          : current
      );

      const currentAvatarUrl = avatarPreview || (profilePhotosService.getProfilePhotoUrl(updatedProfile.avatarUrl) || updatedProfile.avatarUrl || null);
      setLastSubmittedValues({
        name: updatedProfile.name,
        email: updatedProfile.email ?? null,
        isActive: updatedProfile.isActive,
        isDefault: updatedProfile.isDefault,
        avatarUrl: currentAvatarUrl,
      });

      await onProfilesRefresh?.();
      
      window.dispatchEvent(new CustomEvent('profile-changed', { 
        detail: { 
          profileId: profile.id,
          action: 'profile-update',
          timestamp: Date.now()
        } 
      }));
      
      if (requireDefaultProfile && updatedProfile.isDefault) {
        setSuccessMessage('Profil par défaut défini avec succès ! Vous pouvez maintenant continuer.');
        setOriginalIsDefault(updatedProfile.isDefault);
      } else {
        setSuccessMessage('Profil modifié avec succès !');
      }
      
      setIsSubmitting(false);
    } catch (error: any) {
      setErrors({
        submit:
          error.response?.data?.errorMessage ||
          error.message ||
          'Erreur lors de la modification',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors({ submit: 'La taille du fichier ne doit pas dépasser 10 MB' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ submit: 'Format de fichier non supporté (jpg, png, gif, webp uniquement)' });
      return;
    }

    setIsUploadingAvatar(true);
    setErrors({});
    if (successMessage) setSuccessMessage(null);

    try {
      const avatarUrl = await profilesService.uploadAvatar(profile.id, file);
      const fullAvatarUrl = profilePhotosService.getProfilePhotoUrl(avatarUrl) || avatarUrl;
      setAvatarPreview(fullAvatarUrl);
      
      if (lastSubmittedValues) {
        setLastSubmittedValues({
          ...lastSubmittedValues,
          avatarUrl: fullAvatarUrl,
        });
      }
      
      await onProfilesRefresh?.();
      
      window.dispatchEvent(new CustomEvent('profile-changed', { 
        detail: { 
          profileId: profile.id,
          action: 'avatar-upload',
          newAvatarUrl: avatarUrl,
          timestamp: Date.now()
        } 
      }));
      
      toast.success('Avatar mis à jour avec succès');
    } catch (error: any) {
      setErrors({
        submit:
          error.response?.data?.errorMessage ||
          error.message ||
          "Erreur lors de l'upload de l'avatar",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (!profile.avatarUrl) return;

    setIsUploadingAvatar(true);
    setErrors({});

    try {
      await profilesService.deleteAvatar(profile.id);
      setAvatarPreview(null);
      
      if (lastSubmittedValues) {
        setLastSubmittedValues({
          ...lastSubmittedValues,
          avatarUrl: null,
        });
      }
      
      await onProfilesRefresh?.();
      
      window.dispatchEvent(new CustomEvent('profile-changed', { 
        detail: { 
          profileId: profile.id,
          action: 'avatar-delete',
          timestamp: Date.now()
        } 
      }));
      
      toast.success('Avatar supprimé avec succès');
    } catch (error: any) {
      setErrors({
        submit:
          error.response?.data?.errorMessage ||
          error.message ||
          "Erreur lors de la suppression de l'avatar",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const isActiveCheckboxDisabled = formData.isDefault || requireDefaultProfile;
  const isDefaultCheckboxDisabled = !formData.isActive || requireDefaultProfile;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
      >
        <DialogContent 
          className="sm:max-w-[600px]"
          onEscapeKeyDown={(e) => {
            if (requireDefaultProfile && formData && !formData.isDefault && !successMessage) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            if (requireDefaultProfile && formData && !formData.isDefault && !successMessage) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {requireDefaultProfile ? "Définir un profil par défaut" : "Modifier le profil"}
            </DialogTitle>
            <DialogDescription>
              {requireDefaultProfile 
                ? "Vous devez définir ce profil comme profil par défaut pour continuer. Cette action est obligatoire." 
                : "Modifiez les informations de votre profil"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {requireDefaultProfile && !successMessage && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-md text-sm">
                <p className="font-medium">Profil par défaut requis</p>
                <p className="text-sm mt-1">
                  Vous devez définir ce profil comme profil par défaut pour continuer. Cette action est obligatoire.
                </p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-md text-sm relative">
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="absolute top-2 right-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
                  aria-label="Fermer le message"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="font-medium pr-6">✓ Succès</p>
                <p className="text-sm mt-1 pr-6">{successMessage}</p>
              </div>
            )}

            <div className="flex flex-col items-center pb-6 border-b border-gray-200 dark:border-slate-700">
              <AvatarWithInitials
                name={formData.name}
                src={avatarPreview || undefined}
                size="xl"
                className="mb-4"
              />

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploadingAvatar}
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingAvatar ? 'Upload…' : 'Upload'}
                </Button>

                {avatarPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarDelete}
                    disabled={isUploadingAvatar}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-2 text-center">
                JPG, PNG, GIF ou WebP. Max 10MB.
              </p>
            </div>

            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm relative">
                <button
                  type="button"
                  onClick={() => setErrors({ ...errors, submit: undefined })}
                  className="absolute top-2 right-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                  aria-label="Fermer le message d'erreur"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="pr-6">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du profil *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (successMessage) setSuccessMessage(null);
                }}
                placeholder="Ex: Réceptionniste Matin"
                disabled={isSubmitting || isUploadingAvatar}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Input
                id="edit-role"
                value={getRoleLabel(formData.role)}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Le rôle du profil est calé sur le rôle du compte utilisateur
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (optionnel)</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value || null });
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                  if (successMessage) setSuccessMessage(null);
                }}
                placeholder="exemple@hotel.com"
                disabled={isSubmitting || isUploadingAvatar}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Email spécifique pour ce profil. Si non renseigné, l'email de l'utilisateur sera utilisé pour les notifications.
              </p>
            </div>

            {checkPermission(profile, 'activate') && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => {
                      if (isActiveCheckboxDisabled) {
                        return;
                      }
                      const nextIsActive = checked as boolean;
                      setFormData({
                        ...formData,
                        isActive: nextIsActive,
                        isDefault: nextIsActive ? formData.isDefault : false,
                      });
                      if (successMessage) setSuccessMessage(null);
                    }}
                    disabled={isActiveCheckboxDisabled || isSubmitting || isUploadingAvatar}
                  />
                  <Label htmlFor="edit-is-active" className="font-normal cursor-pointer">
                    Profil actif
                  </Label>
                </div>
                {isActiveCheckboxDisabled && (
                  <p className="text-xs text-muted-foreground ml-6">
                    {requireDefaultProfile
                      ? 'Le profil par défaut doit être actif.'
                      : 'Le profil par défaut doit rester actif. Choisissez d\'abord un autre profil par défaut.'}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-is-default"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) => {
                        if (requireDefaultProfile) return;
                        const nextIsDefault = checked as boolean;
                        setFormData({
                          ...formData,
                          isDefault: nextIsDefault,
                          isActive: nextIsDefault ? true : formData.isActive,
                        });
                        if (successMessage) setSuccessMessage(null);
                      }}
                      disabled={isDefaultCheckboxDisabled || requireDefaultProfile || isSubmitting || isUploadingAvatar}
                    />
                    <Label htmlFor="edit-is-default" className="font-normal cursor-pointer">
                      Définir comme profil par défaut
                    </Label>
                  </div>
                  {isDefaultCheckboxDisabled && (
                    <p className="text-xs text-muted-foreground ml-6">
                      {requireDefaultProfile
                        ? 'Ce profil sera automatiquement défini comme profil par défaut.'
                        : 'Seuls les profils actifs peuvent être définis par défaut.'}
                    </p>
                  )}
                </div>

                {originalIsDefault && !formData.isDefault && (
                  <div className="space-y-2">
                    <Label htmlFor="replacement-profile">Profil de remplacement *</Label>
                    <Select
                      value={formData.replacementProfileId || ''}
                      onValueChange={(value) =>
                        setFormData({ ...formData, replacementProfileId: value })
                      }
                    >
                      <SelectTrigger id="replacement-profile">
                        <SelectValue placeholder="Sélectionnez un profil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sélectionnez un profil</SelectItem>
                        {replacementOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.replacementProfileId && (
                      <p className="text-xs text-destructive">{errors.replacementProfileId}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Sélectionnez le profil qui deviendra le profil par défaut
                    </p>
                  </div>
                )}
              </>
            )}

            {checkPermission(profile, 'edit') && (
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sécurité du profil</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Définissez un PIN à 4 chiffres pour sécuriser l'accès à ce profil
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSetPinModalOpen(true)}
                    disabled={isSubmitting || isUploadingAvatar}
                  >
                    {hasPin ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Changer le PIN
                      </>
                    ) : (
                      <>
                        <LockOpen className="h-4 w-4 mr-2" />
                        Définir un PIN
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {(!requireDefaultProfile || successMessage) && (
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting || isUploadingAvatar}
              >
                {successMessage ? 'Fermer' : 'Annuler'}
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isUploadingAvatar || (!hasChanges && !successMessage)}
              title={!hasChanges && !successMessage ? 'Aucune modification détectée' : ''}
            >
              {isSubmitting ? 'Modification…' : 'Modifier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale pour définir/changer le PIN */}
      {isSetPinModalOpen && (
        <SetProfilePinModal
          isOpen={isSetPinModalOpen}
          onClose={() => {
            setIsSetPinModalOpen(false);
            setErrors({});
          }}
          onConfirm={async (pin, currentPin, newPin) => {
            try {
              if (currentPin && newPin) {
                await profilesService.changeProfilePin(profile.id, currentPin, newPin);
              } else if (pin) {
                await profilesService.setProfilePin(profile.id, pin);
              }
              
              const refreshedProfiles = await onProfilesRefresh?.();
              if (refreshedProfiles && Array.isArray(refreshedProfiles)) {
                const updatedProfile = refreshedProfiles.find(p => p.id === profile.id);
                if (updatedProfile) {
                  setHasPin(!!updatedProfile.pin_hash);
                }
              } else {
                setHasPin(true);
              }
              setIsSetPinModalOpen(false);
              setErrors({});
              toast.success(hasPin ? 'PIN modifié avec succès' : 'PIN défini avec succès');
            } catch (err: any) {
              const errorMessage = err.response?.data?.errorMessage || err.message || 'Erreur lors de la gestion du PIN';
              setErrors({ submit: errorMessage });
              if (err.response?.status !== 401) {
                throw err;
              }
            }
          }}
          profileName={profile.name}
          hasPin={hasPin ?? false}
          error={errors.submit}
        />
      )}
    </>
  );
};

// ==================== MODALE POUR DÉFINIR/CHANGER LE PIN ====================
interface SetProfilePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin?: string, currentPin?: string, newPin?: string) => Promise<void>;
  profileName: string;
  hasPin?: boolean;
  error?: string | null;
}

const SetProfilePinModal: React.FC<SetProfilePinModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  profileName,
  hasPin = false,
  error,
}) => {
  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const currentPinInputRef = useRef<HTMLInputElement>(null);
  const newPinInputRef = useRef<HTMLInputElement>(null);
  const confirmPinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setLocalError(null);
      setShowPin(false);
      setShowCurrentPin(false);
      setShowNewPin(false);
      setShowConfirmPin(false);
      setTimeout(() => {
        if (hasPin) {
          currentPinInputRef.current?.focus();
        } else {
          pinInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, hasPin]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleSubmit = async () => {
    setLocalError(null);

    if (hasPin) {
      if (!currentPin || currentPin.length !== 4) {
        setLocalError('Le PIN actuel doit contenir exactement 4 chiffres');
        return;
      }

      if (!newPin || newPin.length !== 4) {
        setLocalError('Le nouveau PIN doit contenir exactement 4 chiffres');
        return;
      }

      if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin)) {
        setLocalError('Les PIN doivent contenir uniquement des chiffres');
        return;
      }

      if (currentPin === newPin) {
        setLocalError('Le nouveau PIN doit être différent de l\'actuel');
        return;
      }

      if (newPin !== confirmPin) {
        setLocalError('Les deux nouveaux PIN ne correspondent pas');
        return;
      }

      setIsSubmitting(true);
      setLocalError(null);
      try {
        await onConfirm(undefined, currentPin, newPin);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        onClose();
      } catch (err: any) {
        const errorMessage = err.response?.data?.errorMessage || err.message || 'Erreur lors du changement du PIN';
        setLocalError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!pin || pin.length !== 4) {
        setLocalError('Le PIN doit contenir exactement 4 chiffres');
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        setLocalError('Le PIN doit contenir uniquement des chiffres');
        return;
      }

      if (pin !== confirmPin) {
        setLocalError('Les deux PIN ne correspondent pas');
        return;
      }

      setIsSubmitting(true);
      setLocalError(null);
      try {
        await onConfirm(pin);
        setPin('');
        setConfirmPin('');
        onClose();
      } catch (err: any) {
        const errorMessage = err.response?.data?.errorMessage || err.message || 'Erreur lors de la définition du PIN';
        setLocalError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePinChange = (
    value: string,
    setter: (value: string) => void,
    nextInputRef?: React.RefObject<HTMLInputElement>
  ) => {
    const numericValue = value.replace(/\D/g, '');
    const limitedValue = numericValue.slice(0, 4);
    setter(limitedValue);
    setLocalError(null);

    if (limitedValue.length === 4) {
      setTimeout(() => {
        nextInputRef?.current?.focus();
      }, 10);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (hasPin) {
      if (e.key === 'Enter' && currentPin.length === 4 && newPin.length === 4 && confirmPin.length === 4) {
        handleSubmit();
      }
    } else {
      if (e.key === 'Enter' && pin.length === 4 && confirmPin.length === 4) {
        handleSubmit();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{hasPin ? "Changer le PIN" : "Définir le PIN"}</DialogTitle>
          <DialogDescription>
            {hasPin
              ? `Modifiez le PIN à 4 chiffres pour le profil "${profileName}".`
              : `Définissez un PIN à 4 chiffres pour sécuriser le profil "${profileName}".`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {localError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm">
              {localError}
            </div>
          )}

          {hasPin ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="current-pin">PIN actuel (4 chiffres)</Label>
                <div className="relative">
                  <Input
                    ref={currentPinInputRef}
                    id="current-pin"
                    type={showCurrentPin ? "text" : "password"}
                    inputMode="numeric"
                    value={currentPin}
                    onChange={(e) => handlePinChange(e.target.value, setCurrentPin, newPinInputRef)}
                    onKeyPress={handleKeyPress}
                    placeholder="0000"
                    maxLength={4}
                    required
                    autoFocus
                    className="text-center text-2xl tracking-widest font-mono pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showCurrentPin ? "Masquer le PIN" : "Afficher le PIN"}
                  >
                    {showCurrentPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-pin">Nouveau PIN (4 chiffres)</Label>
                <div className="relative">
                  <Input
                    ref={newPinInputRef}
                    id="new-pin"
                    type={showNewPin ? "text" : "password"}
                    inputMode="numeric"
                    value={newPin}
                    onChange={(e) => handlePinChange(e.target.value, setNewPin, confirmPinInputRef)}
                    onKeyPress={handleKeyPress}
                    placeholder="0000"
                    maxLength={4}
                    required
                    className="text-center text-2xl tracking-widest font-mono pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showNewPin ? "Masquer le PIN" : "Afficher le PIN"}
                  >
                    {showNewPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-pin">Confirmer le nouveau PIN</Label>
                <div className="relative">
                  <Input
                    ref={confirmPinInputRef}
                    id="confirm-new-pin"
                    type={showConfirmPin ? "text" : "password"}
                    inputMode="numeric"
                    value={confirmPin}
                    onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
                    onKeyPress={handleKeyPress}
                    placeholder="0000"
                    maxLength={4}
                    required
                    className="text-center text-2xl tracking-widest font-mono pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPin ? "Masquer le PIN" : "Afficher le PIN"}
                  >
                    {showConfirmPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="set-pin">Nouveau PIN (4 chiffres)</Label>
                <div className="relative">
                  <Input
                    ref={pinInputRef}
                    id="set-pin"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value, setPin, confirmPinInputRef)}
                    onKeyPress={handleKeyPress}
                    placeholder="0000"
                    maxLength={4}
                    required
                    autoFocus
                    className="text-center text-2xl tracking-widest font-mono pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPin ? "Masquer le PIN" : "Afficher le PIN"}
                  >
                    {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pin">Confirmer le PIN</Label>
                <div className="relative">
                  <Input
                    ref={confirmPinInputRef}
                    id="confirm-pin"
                    type={showConfirmPin ? "text" : "password"}
                    inputMode="numeric"
                    value={confirmPin}
                    onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
                    onKeyPress={handleKeyPress}
                    placeholder="0000"
                    maxLength={4}
                    required
                    className="text-center text-2xl tracking-widest font-mono pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPin ? "Masquer le PIN" : "Afficher le PIN"}
                  >
                    {showConfirmPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (hasPin
                ? currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4
                : pin.length !== 4 || confirmPin.length !== 4)
            }
          >
            {isSubmitting ? 'Enregistrement...' : hasPin ? 'Changer' : 'Définir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==================== MODALE DE SUPPRESSION ====================
interface ProfileDeleteModalProps extends BaseModalProps {
  profile: Profile | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  error?: string | null;
}

export const ProfileDeleteModal: React.FC<ProfileDeleteModalProps> = ({
  isOpen,
  onClose,
  profile,
  onConfirm,
  isDeleting,
  error,
}) => {
  const [displayedError, setDisplayedError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (error) {
      setDisplayedError(error);
    } else {
      setDisplayedError(null);
    }
  }, [error]);

  useEffect(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    if (displayedError) {
      errorTimeoutRef.current = setTimeout(() => {
        setDisplayedError(null);
      }, 5000);
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [displayedError]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Supprimer le profil</DialogTitle>
          <DialogDescription>
            Cette action est irréversible
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Action irréversible</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Êtes-vous sûr de vouloir supprimer le profil "{profile?.name}" ?
              </p>
            </div>
          </div>

          {displayedError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm">
              {displayedError}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Cette action ne peut pas être annulée. Toutes les données associées à ce profil seront définitivement supprimées.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==================== MODALE DE PIN ====================
interface ProfilePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
  profileName: string;
  isChanging?: boolean;
  error?: string | null;
}

export const ProfilePinModal: React.FC<ProfilePinModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  profileName,
  isChanging = false,
  error,
}) => {
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setLocalError(null);
      setShowPin(false);
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    } else {
      setLocalError(null);
      setShowPin(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setLocalError(null);
    } else if (error) {
      setLocalError(error);
    }
  }, [error, isOpen]);

  const handleSubmit = async () => {
    setLocalError(null);

    if (!pin || pin.length !== 4) {
      setLocalError('Le PIN doit contenir exactement 4 chiffres');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setLocalError('Le PIN doit contenir uniquement des chiffres');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    try {
      await onConfirm(pin);
      setPin('');
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.errorMessage || err.message || 'Erreur lors de la vérification du PIN';
      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const limitedValue = numericValue.slice(0, 4);
    setPin(limitedValue);
    setLocalError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pin.length === 4) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {isChanging ? 'Changer le PIN' : 'PIN requis'}
          </DialogTitle>
          <DialogDescription>
            {isChanging
              ? `Entrez votre PIN actuel pour le profil "${profileName}"`
              : `Veuillez renseigner le PIN pour accéder à ce profil.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {localError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm">
              {localError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin">PIN (4 chiffres)</Label>
            <div className="relative">
              <Input
                ref={pinInputRef}
                id="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0000"
                maxLength={4}
                required
                autoFocus
                className="text-center text-2xl tracking-widest font-mono pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPin ? "Masquer le PIN" : "Afficher le PIN"}
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || pin.length !== 4}>
            {isSubmitting ? 'Vérification...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

