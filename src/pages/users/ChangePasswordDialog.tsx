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
import { User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
      .regex(
        /[^A-Za-z0-9]/,
        "Le mot de passe doit contenir au moins un caractère spécial"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  user,
}: ChangePasswordDialogProps) {
  const queryClient = useQueryClient();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (password: string) =>
      usersService.update(user.id, { password }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(response.message);
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      // Message d'erreur plus spécifique
      let errorMessage = "Erreur lors de la modification du mot de passe";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.errorMessage) {
        errorMessage = error.response.data.errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data.newPassword);
  };

  const newPassword = form.watch("newPassword");

  // Validation visuelle des critères
  const validations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Changer le mot de passe</DialogTitle>
          <DialogDescription>
            Modifier le mot de passe de {user.firstName} {user.lastName || ""}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? (
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

            {/* Indicateurs de validation */}
            <div className="space-y-2 rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">
                Le mot de passe doit contenir :
              </p>
              <div className="space-y-1">
                <ValidationItem
                  isValid={validations.length}
                  text="Au moins 8 caractères"
                />
                <ValidationItem
                  isValid={validations.uppercase}
                  text="Au moins une majuscule"
                />
                <ValidationItem
                  isValid={validations.lowercase}
                  text="Au moins une minuscule"
                />
                <ValidationItem
                  isValid={validations.number}
                  text="Au moins un chiffre"
                />
                <ValidationItem
                  isValid={validations.special}
                  text="Au moins un caractère spécial (!@#$%^&*...)"
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending
                  ? "Modification..."
                  : "Modifier le mot de passe"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Composant pour afficher les critères de validation
function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isValid ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={isValid ? "text-green-600" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );
}
