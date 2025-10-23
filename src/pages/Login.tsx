// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoginLoading, loginError, isAuthenticated, user } =
    useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Capturer l'erreur de login dans un état local
  useEffect(() => {
    if (loginError) {
      const message =
        (
          loginError as {
            response?: { data?: { errorMessage?: string } };
          }
        )?.response?.data?.errorMessage || "Email ou mot de passe incorrect";

      setErrorMessage(message);
      console.log("Erreur capturée:", message);
    }
  }, [loginError]);

  // Rediriger seulement si vraiment authentifié avec un user
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Redirection après authentification réussie");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    // Réinitialiser le message d'erreur avant chaque tentative
    setErrorMessage(null);
    console.log("Tentative de connexion...");

    try {
      await login(data);
      console.log("Login réussi");
    } catch (error) {
      // L'erreur sera capturée par le useEffect qui surveille loginError
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Back Office
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
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
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorMessage && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoginLoading}
              >
                {isLoginLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Se connecter
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
