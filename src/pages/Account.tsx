// src/pages/Account.tsx
import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { usersService } from "@/services/users.service";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import {
  User as UserIcon,
  Mail,
  Shield,
  Phone,
  Briefcase,
  Calendar,
  Clock,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

// Schémas de validation Zod
const profileFormSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").max(50),
  lastName: z.string().max(50).optional(),
  email: z.string().email("Email invalide").min(1, "L'email est requis"),
  phone: z.string().optional(),
  position: z.string().max(100).optional(),
});

const passwordFormSchema = z
  .object({
    oldPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const superAdminFormSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis").max(50),
    lastName: z.string().max(50).optional(),
    email: z.string().email("Email invalide").min(1, "L'email est requis"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type SuperAdminFormValues = z.infer<typeof superAdminFormSchema>;

// Composant pour l'indicateur de force du mot de passe
function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return {
        score,
        label: "Faible",
        color: "bg-red-500",
        textColor: "text-red-600",
      };
    if (score <= 4)
      return {
        score,
        label: "Moyen",
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
      };
    return {
      score,
      label: "Fort",
      color: "bg-green-500",
      textColor: "text-green-600",
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", strength.textColor)}>
          {strength.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {strength.score}/6
        </span>
      </div>
      <div className="flex gap-1">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              i < strength.score
                ? strength.color
                : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {password.length >= 8 ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-gray-400" />
          )}
          <span>Au moins 8 caractères</span>
        </div>
        <div className="flex items-center gap-2">
          {/[A-Z]/.test(password) ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-gray-400" />
          )}
          <span>Une lettre majuscule</span>
        </div>
        <div className="flex items-center gap-2">
          {/[a-z]/.test(password) ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-gray-400" />
          )}
          <span>Une lettre minuscule</span>
        </div>
        <div className="flex items-center gap-2">
          {/[0-9]/.test(password) ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-gray-400" />
          )}
          <span>Un chiffre</span>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // États pour les dialogs
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCreateSuperAdminDialog, setShowCreateSuperAdminDialog] =
    useState(false);
  const [showPasswordConfirmationDialog, setShowPasswordConfirmationDialog] =
    useState(false);
  const [showPasswordOld, setShowPasswordOld] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Formulaire principal (informations personnelles)
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      position: user?.position || "",
    },
  });

  // Formulaire de changement de mot de passe
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Formulaire de création de Super Admin
  const superAdminForm = useForm<SuperAdminFormValues>({
    resolver: zodResolver(superAdminFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Surveiller le champ newPassword pour l'indicateur de force
  // const newPasswordValue = passwordForm.watch("newPassword");
  // const superAdminPasswordValue = superAdminForm.watch("password");

  // Mutation pour mettre à jour les informations
  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormValues) =>
      usersService.update(user!.id, {
        firstName: data.firstName,
        lastName: data.lastName || undefined,
        email: data.email,
        phone: data.phone || undefined,
        position: data.position || undefined,
      }),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { errorMessage?: string } };
      };
      toast.error(
        axiosError.response?.data?.errorMessage ||
          "Erreur lors de la mise à jour"
      );
    },
  });

  // Mutation pour créer un Super Admin
  const createSuperAdminMutation = useMutation({
    mutationFn: (data: SuperAdminFormValues) =>
      usersService.create({
        firstName: data.firstName,
        lastName: data.lastName || undefined,
        email: data.email,
        password: data.password,
        role: "SUPER_ADMIN",
      }),
    onSuccess: (response) => {
      toast.success(`Super Admin créé avec succès : ${response.email}`);
      setShowCreateSuperAdminDialog(false);
      superAdminForm.reset();
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { errorMessage?: string } };
      };
      toast.error(
        axiosError.response?.data?.errorMessage ||
          "Erreur lors de la création du Super Admin"
      );
    },
  });

  // Mutation pour changer le mot de passe
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormValues) =>
      authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: (response) => {
      toast.success(response.message);
      setShowPasswordDialog(false);
      passwordForm.reset();

      // Afficher un message informatif sur la déconnexion
      setTimeout(() => {
        toast.info(
          "Vous allez être redirigé vers la page de connexion pour vous reconnecter avec votre nouveau mot de passe."
        );

        // Déclencher la déconnexion après le message
        setTimeout(() => {
          logout();
        }, 2000);
      }, 1000);
    },
    onError: (error: any) => {
      // Message d'erreur plus spécifique
      let errorMessage = "Erreur lors du changement de mot de passe";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.errorMessage) {
        errorMessage = error.response.data.errorMessage;
      } else if (error.response?.data?.errorName === "INVALID_CREDENTIALS") {
        errorMessage = "Mot de passe actuel incorrect";
      }

      toast.error(errorMessage);
    },
  });

  // Handlers pour les formulaires
  const onSubmitProfile = (data: ProfileFormValues) => {
    updateMutation.mutate(data);
  };

  const onSubmitPassword = () => {
    // Au lieu de changer directement le mot de passe, afficher le dialogue de confirmation
    setShowPasswordConfirmationDialog(true);
  };

  const confirmPasswordChange = () => {
    // Récupérer les données du formulaire et procéder au changement
    const formData = passwordForm.getValues();
    changePasswordMutation.mutate(formData);
    setShowPasswordConfirmationDialog(false);
  };

  const onSubmitSuperAdmin = (data: SuperAdminFormValues) => {
    createSuperAdminMutation.mutate(data);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Administrateur";
      case "ADMIN":
        return "Administrateur";
      case "STAFF":
        return "Personnel";
      default:
        return role;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Header title="Mon Compte" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Informations personnelles avec React Hook Form */}
        <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl">
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Mettez à jour vos informations de profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          Prénom *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre prénom"
                            {...field}
                            className="transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre nom (optionnel)"
                            {...field}
                            className="transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="votre@email.com"
                          {...field}
                          className="transition-all"
                        />
                      </FormControl>
                      <FormDescription>
                        Votre adresse email principale
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          Téléphone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+221 77 123 45 67"
                            {...field}
                            className="transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          Fonction
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Directeur, Réceptionniste"
                            {...field}
                            className="transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 border-t space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Rôle global
                    </Label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <Badge
                        variant="outline"
                        className="text-sm font-semibold px-3 py-1"
                      >
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Membre depuis
                      </Label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {new Date(user.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Dernière connexion
                      </Label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {new Date().toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="gap-2 min-w-[180px]"
                    size="lg"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Gestion du mot de passe
            </CardTitle>
            <CardDescription>Modifiez votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-2 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base">Mot de passe</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ••••••••••••
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dernière modification: jamais
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Lock className="h-4 w-4" />
                Modifier le mot de passe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section création Super Admin (Super Admin seulement) */}
        {user?.role === "SUPER_ADMIN" && (
          <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-primary/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                Nouveau Compte
              </CardTitle>
              <CardDescription>
                Créez un nouvel utilisateur pour administrer le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-2 rounded-xl bg-primary/5 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Attention ! Cet utilisateur aura accès à toutes les
                      fonctionnalités du système.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCreateSuperAdminDialog(true)}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Nouvel administrateur
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section compte par défaut (Super Admin seulement) */}
        {user?.role === "SUPER_ADMIN" && (
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-2 border-amber-200 dark:border-amber-900">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                Compte par défaut
              </CardTitle>
              <CardDescription>
                Gérez le statut de compte par défaut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-2 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    {user.isDefault ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-base">
                      {user.isDefault ? "Compte protégé" : "Compte standard"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.isDefault
                        ? "Ce compte ne peut pas être supprimé du système"
                        : "Ce compte peut être supprimé par un administrateur"}
                    </p>
                  </div>
                </div>
                {!user.isDefault ? (
                  <Button
                    variant="default"
                    onClick={async () => {
                      try {
                        const response = await usersService.update(user.id, {
                          isDefault: true,
                        });
                        await queryClient.invalidateQueries({
                          queryKey: queryKeys.auth.currentUser,
                        });
                        toast.success(response.message);
                      } catch (error: any) {
                        toast.error(
                          error.response?.data?.errorMessage ||
                            "Erreur lors de la mise à jour"
                        );
                      }
                    }}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Marquer par défaut
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        const response = await usersService.update(user.id, {
                          isDefault: false,
                        });
                        await queryClient.invalidateQueries({
                          queryKey: queryKeys.auth.currentUser,
                        });
                        toast.success(response.message);
                      } catch (error: any) {
                        toast.error(
                          error.response?.data?.errorMessage ||
                            "Erreur lors de la mise à jour"
                        );
                      }
                    }}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Retirer le statut
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog création Super Admin */}
        <Dialog
          open={showCreateSuperAdminDialog}
          onOpenChange={setShowCreateSuperAdminDialog}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                Nouvel administrateur système
              </DialogTitle>
              <DialogDescription className="text-base">
                Configurez les informations du nouvel utilisateur avec accès
                administrateur
              </DialogDescription>
            </DialogHeader>

            <Form {...superAdminForm}>
              <form
                onSubmit={superAdminForm.handleSubmit(onSubmitSuperAdmin)}
                className="space-y-6 py-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={superAdminForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={superAdminForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom (optionnel)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={superAdminForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemple.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={superAdminForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Au moins 8 caractères"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {/* Indicateur de force du mot de passe */}
                      {field.value && (
                        <div className="mt-3">
                          <PasswordStrengthIndicator password={field.value} />
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={superAdminForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Retapez le mot de passe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateSuperAdminDialog(false);
                      superAdminForm.reset();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSuperAdminMutation.isPending}
                    className="gap-2"
                  >
                    {createSuperAdminMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Créer l'administrateur
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog changement de mot de passe avec indicateur de force */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                Changer le mot de passe
              </DialogTitle>
              <DialogDescription className="text-base">
                Saisissez votre mot de passe actuel et choisissez un nouveau mot
                de passe sécurisé
              </DialogDescription>
            </DialogHeader>

            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                className="space-y-6 py-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe actuel</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswordOld ? "text" : "password"}
                            placeholder="Votre mot de passe actuel"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordOld(!showPasswordOld)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswordOld ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswordNew ? "text" : "password"}
                            placeholder="Au moins 8 caractères"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordNew(!showPasswordNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswordNew ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {/* Indicateur de force du mot de passe */}
                      {field.value && (
                        <div className="mt-3">
                          <PasswordStrengthIndicator password={field.value} />
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswordConfirm ? "text" : "password"}
                            placeholder="Retapez le nouveau mot de passe"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordConfirm(!showPasswordConfirm)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswordConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordDialog(false);
                      passwordForm.reset();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="gap-2"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Modifier le mot de passe
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialogue de confirmation pour le changement de mot de passe */}
        <AlertDialog
          open={showPasswordConfirmationDialog}
          onOpenChange={setShowPasswordConfirmationDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                Confirmation du changement de mot de passe
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                <div className="space-y-3">
                  <p>
                    Changer votre mot de passe vous déconnectera
                    automatiquement.
                  </p>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        Vous devrez vous reconnecter avec votre nouveau mot de
                        passe.
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Continuer ?</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setShowPasswordConfirmationDialog(false)}
              >
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmPasswordChange}
                className="bg-primary hover:bg-primary/90"
              >
                <Lock className="h-4 w-4 mr-2" />
                Confirmer le changement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
