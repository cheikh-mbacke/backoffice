// src/pages/Users/UserFormDialog.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const userSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .optional(),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  hotelId: z.string().min(1, "Veuillez sélectionner un hôtel"), // OBLIGATOIRE pour les ADMIN
  phone: z.string().optional(), // NOUVEAU
  position: z.string().optional(), // NOUVEAU (ex: "Directeur", "Responsable Réception")
});

type UserFormValues = z.infer<typeof userSchema>;

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

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
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
        password: "", // Ne pas pré-remplir le mot de passe
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

  const onSubmit = (data: UserFormValues) => {
    // Supprimer le password si vide en mode édition
    const submitData = {
      ...data,
      role: UserRole.ADMIN, // Toujours ADMIN pour les contacts d'hôtels
    };
    if (isEditing && !submitData.password) {
      delete submitData.password;
    }

    // S'assurer que le password est défini pour la création
    if (!isEditing && !submitData.password) {
      submitData.password = "defaultPassword123!"; // Mot de passe par défaut
    }

    // Type assertion pour éviter l'erreur TypeScript
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
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Modifier l'Admin d'Hôtel"
              : "Ajouter un Admin d'Hôtel"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du contact principal de l'hôtel"
              : "Ajoutez un nouveau contact principal pour un hôtel"}
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
                    <FormLabel>Nom *</FormLabel>
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mot de passe{" "}
                    {isEditing ? "(laisser vide pour ne pas modifier)" : "*"}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    L'hôtel pour lequel cette personne sera l'administrateur
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
    </Dialog>
  );
}
