// src/pages/Users/UserFormDialog.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wand2, Eye, EyeOff, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { useHotels } from "@/hooks/useHotels";
import { User, UserRole, CreateUserDto } from "@/types";
import { usersService } from "@/services/users.service";
import { toast } from "sonner";

const userSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z
    .string()
    .refine(
      (val) => val.trim().length === 0 || val.trim().length >= 2,
      "Le nom doit contenir au moins 2 caractères"
    )
    .optional(),
  hotelId: z.string().min(1, "Veuillez sélectionner un hôtel"),
  phone: z.string().optional(),
  position: z.string().optional(),
});

// Schéma pour l'édition (sans mot de passe obligatoire)
const userEditSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z
    .string()
    .refine(
      (val) => val.trim().length === 0 || val.trim().length >= 2,
      "Le nom doit contenir au moins 2 caractères"
    )
    .optional(),
  hotelId: z.string().min(1, "Veuillez sélectionner un hôtel"),
  phone: z.string().optional(),
  position: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;
type UserEditFormValues = z.infer<typeof userEditSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const { createUser, updateUser, isCreating, isUpdating } = useUsers();
  const { hotels } = useHotels(1, 100); // Récupérer tous les hôtels
  const isEditing = !!user;
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [createdUser, setCreatedUser] = useState<{
    id: string;
    email: string;
    password: string;
  } | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailDestination, setEmailDestination] = useState("");

  const form = useForm<UserFormValues | UserEditFormValues>({
    resolver: zodResolver(isEditing ? userEditSchema : userSchema),
    defaultValues: isEditing
      ? {
          email: "",
          firstName: "",
          lastName: "",
          hotelId: "",
          phone: "",
          position: "",
        }
      : {
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          hotelId: "",
          phone: "",
          position: "",
        },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hotelId: user.hotelId || "",
        phone: user.phone || "",
        position: user.position || "",
      });
    } else {
      form.reset({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        hotelId: "",
        phone: "",
        position: "",
      });
    }
  }, [user, form]);

  const handleGeneratePassword = async () => {
    setIsGenerating(true);
    try {
      const response = await usersService.generatePassword();
      form.setValue("password", response.password);
      toast.success(response.message);
    } catch (error) {
      toast.error("Erreur lors de la génération du mot de passe");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPassword = () => {
    const password = form.getValues("password");
    if (password) {
      navigator.clipboard.writeText(password);
      setIsCopied(true);
      toast.success("Mot de passe copié dans le presse-papier");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const onSubmit = (data: UserFormValues | UserEditFormValues) => {
    const submitData = {
      ...data,
      role: UserRole.MANAGER,
    };

    // S'assurer que le password est défini pour la création
    if (!isEditing) {
      (submitData as any).password = (data as UserFormValues).password;
    }

    const createData = submitData as CreateUserDto;

    if (isEditing && user) {
      updateUser(
        { id: user.id, data: submitData },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createUser(createData, {
        onSuccess: (response) => {
          // La réponse contient directement l'utilisateur créé
          setCreatedUser({
            id: response.id,
            email: createData.email,
            password: createData.password,
          });
          // Pré-remplir avec l'email de l'utilisateur créé
          setEmailDestination(createData.email);
        },
      });
    }
  };

  const handleSendCredentials = async () => {
    if (!createdUser || !emailDestination) return;

    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailDestination)) {
      toast.error("Adresse email invalide");
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await usersService.sendCredentials(
        createdUser.id,
        createdUser.password,
        true,
        emailDestination
      );
      toast.success(response.message);
      // Fermer et réinitialiser
      setCreatedUser(null);
      setEmailDestination("");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSkipEmail = () => {
    setCreatedUser(null);
    setEmailDestination("");
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Modifier le Manager d'Hôtel"
              : "Ajouter un Manager d'Hôtel"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du manager de l'hôtel"
              : "Ajoutez un nouveau manager pour un hôtel"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jean.dupont@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pr-24"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleGeneratePassword}
                            disabled={isGenerating}
                          >
                            <Wand2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCopyPassword}
                            disabled={!field.value}
                          >
                            {isCopied ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="hotelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hôtel *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un hôtel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hotels.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    L'hôtel pour lequel cette personne sera le manager
                    principal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fonction dans l'hôtel</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Directeur, Responsable Réception, Manager"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Poste occupé dans l'hôtel (optionnel)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+33 1 23 45 67 89" {...field} />
                  </FormControl>
                  <FormDescription>
                    Numéro de téléphone de contact (optionnel)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isEditing ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Dialogue de confirmation pour envoyer les identifiants */}
      <Dialog
        open={!!createdUser}
        onOpenChange={(open) => !open && handleSkipEmail()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Utilisateur créé avec succès ! 🎉</DialogTitle>
            <DialogDescription>
              Voulez-vous envoyer les identifiants de connexion par email ?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="emailTo" className="text-sm font-medium">
                Adresse email de destination *
              </label>
              <Input
                id="emailTo"
                type="email"
                placeholder="email@example.com"
                value={emailDestination}
                onChange={(e) => setEmailDestination(e.target.value)}
                disabled={isSendingEmail}
              />
              <p className="text-xs text-muted-foreground">
                Par défaut : {createdUser?.email}. Vous pouvez modifier pour
                envoyer à une autre adresse.
              </p>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">
                Les identifiants suivants seront envoyés :
              </p>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Email de connexion :</strong> {createdUser?.email}
                </p>
                <p>
                  <strong>Mot de passe :</strong>{" "}
                  <code className="bg-background px-2 py-1 rounded">
                    {createdUser?.password}
                  </code>
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Un email de bienvenue sera envoyé avec les informations de
              connexion.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipEmail}
              disabled={isSendingEmail}
            >
              Plus tard
            </Button>
            <Button
              type="button"
              onClick={handleSendCredentials}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? "Envoi en cours..." : "Envoyer par email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
