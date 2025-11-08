// src/pages/Hotels/HotelFormDialog.tsx
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
import { useHotels } from "@/hooks/useHotels";
import { Hotel, SubscriptionPlan, SubscriptionStatus } from "@/types";

const hotelSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  address: z
    .string()
    .max(200, "L'adresse ne peut pas dépasser 200 caractères")
    .optional(),

  // CHAMPS SaaS
  status: z.nativeEnum(SubscriptionStatus).optional(),
  subscriptionPlan: z.nativeEnum(SubscriptionPlan),

  contactName: z.string().max(100, "Le nom du contact ne peut pas dépasser 100 caractères").optional(),
  contactEmail: z
    .string()
    .email("Email invalide")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().max(20, "Le téléphone ne peut pas dépasser 20 caractères").optional(),
});

type HotelFormValues = z.infer<typeof hotelSchema>;

interface HotelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel: Hotel | null;
}

export function HotelFormDialog({
  open,
  onOpenChange,
  hotel,
}: HotelFormDialogProps) {
  const { createHotel, updateHotel, isCreating, isUpdating } = useHotels();
  const isEditing = !!hotel;

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: "",
      address: "",
      subscriptionPlan: SubscriptionPlan.TRIAL,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  useEffect(() => {
    if (hotel) {
      form.reset({
        name: hotel.name || "",
        address: hotel.address || "",
        status: hotel.status,
        subscriptionPlan: hotel.subscriptionPlan,
        contactName: hotel.contactName || "",
        contactEmail: hotel.contactEmail || "",
        contactPhone: hotel.contactPhone || "",
      });
    } else {
      form.reset({
        name: "",
        address: "",
        subscriptionPlan: SubscriptionPlan.STARTER,
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      });
    }
  }, [hotel, form]);

  const sanitizePayload = (values: HotelFormValues, isCreate = false) => {
    const payload = {
      ...values,
      contactName: values.contactName?.trim() || undefined,
      contactEmail: values.contactEmail?.trim()
        ? values.contactEmail.trim()
        : undefined,
      contactPhone: values.contactPhone?.trim() || undefined,
      address: values.address?.trim() || undefined,
    };

    if (isCreate) {
      delete payload.status;
    }

    return payload;
  };

  const onSubmit = (data: HotelFormValues) => {
    if (isEditing && hotel) {
      const payload = sanitizePayload(data);
      updateHotel(
        { id: hotel.id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      const payload = sanitizePayload(data, true);
      createHotel(payload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'Hôtel" : "Ajouter un Hôtel"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l'hôtel"
              : "Ajoutez un nouvel hôtel à la plateforme"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'hôtel *</FormLabel>
                    <FormControl>
                      <Input placeholder="Hotel Royal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscriptionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan d'abonnement *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      key={`plan-${hotel?.id || "new"}`}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SubscriptionPlan.FREE}>
                          FREE
                        </SelectItem>
                        <SelectItem value={SubscriptionPlan.TRIAL}>
                          TRIAL
                        </SelectItem>
                        <SelectItem value={SubscriptionPlan.STARTER}>
                          STARTER
                        </SelectItem>
                        <SelectItem value={SubscriptionPlan.PROFESSIONAL}>
                          PROFESSIONAL
                        </SelectItem>
                        <SelectItem value={SubscriptionPlan.ENTERPRISE}>
                          ENTERPRISE
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Statut - Uniquement en édition */}
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut de l'hôtel *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      key={`status-${hotel?.id || "new"}`}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SubscriptionStatus.ACTIVE}>
                          ✅ ACTIF - Accès complet
                        </SelectItem>
                        <SelectItem value={SubscriptionStatus.SUSPENDED}>
                          ⏸️ SUSPENDU - Accès bloqué
                        </SelectItem>
                        <SelectItem value={SubscriptionStatus.CANCELLED}>
                          ❌ ANNULÉ - Compte fermé
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚠️ Les utilisateurs ne pourront plus se connecter si le
                      statut est SUSPENDU ou ANNULÉ
                    </p>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Rue de la Paix, Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Contact Principal</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+33 1 23 45 67 89" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contact</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@hotel-royal.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
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
