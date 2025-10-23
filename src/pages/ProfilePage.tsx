// src/pages/ProfilePage.tsx
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import {
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function ProfilePage() {
  const { user } = useAuth();

  // Fonction pour obtenir la couleur du badge selon le rôle
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "bg-purple-600 text-white";
      case UserRole.ADMIN:
        return "bg-blue-600 text-white";
      case UserRole.STAFF:
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Fonction pour obtenir le label du rôle
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "Super Administrateur";
      case UserRole.ADMIN:
        return "Administrateur";
      case UserRole.STAFF:
        return "Staff";
      default:
        return "Inconnu";
    }
  };

  // Fonction pour obtenir la description du rôle
  const getRoleDescription = (role?: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "Accès complet à toutes les fonctionnalités de la plateforme, y compris le dashboard SaaS, la gestion de tous les hôtels et utilisateurs.";
      case UserRole.ADMIN:
        return "Gestion de votre hôtel et de ses utilisateurs. Accès à la liste des hôtels et à la gestion des utilisateurs de votre établissement.";
      case UserRole.STAFF:
        return "Accès limité aux fonctionnalités de base de votre hôtel.";
      default:
        return "Rôle non défini";
    }
  };

  // Permissions selon le rôle
  const getPermissions = (role?: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return [
          "Accès au Dashboard SaaS avec toutes les métriques",
          "Gestion de tous les hôtels (création, modification, suppression)",
          "Gestion de tous les utilisateurs de tous les hôtels",
          "Accès aux statistiques globales de la plateforme",
          "Configuration des plans d'abonnement",
        ];
      case UserRole.ADMIN:
        return [
          "Consultation de la liste des hôtels",
          "Gestion des utilisateurs de votre hôtel uniquement",
          "Accès aux statistiques de votre hôtel",
        ];
      case UserRole.STAFF:
        return [
          "Accès aux fonctionnalités de base",
          "Consultation des informations de votre hôtel",
        ];
      default:
        return [];
    }
  };

  if (!user) {
    return (
      <div>
        <Header title="Mon Profil" />
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Chargement des informations...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Mon Profil" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Carte principale - Informations utilisateur */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-indigo-600 text-white flex-shrink-0">
                <span className="text-2xl sm:text-3xl font-bold">
                  {user.firstName?.[0]?.toUpperCase()}
                  {user.lastName?.[0]?.toUpperCase()}
                </span>
              </div>

              {/* Informations */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="text-lg font-semibold">
                      {user.firstName
                        ? user.firstName.charAt(0).toUpperCase() +
                          user.firstName.slice(1).toLowerCase()
                        : ""}{" "}
                      {user.lastName?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="text-lg">{user.phone}</p>
                    </div>
                  </div>
                )}

                {user.position && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Poste</p>
                      <p className="text-lg">{user.position}</p>
                    </div>
                  </div>
                )}

                {user.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Membre depuis
                      </p>
                      <p className="text-lg">
                        {format(new Date(user.createdAt), "dd MMMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Rôle et Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Rôle et Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Badge du rôle */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rôle actuel</p>
              <Badge
                className={`text-sm py-1.5 px-4 ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {getRoleLabel(user.role)}
              </Badge>
            </div>

            {/* Description du rôle */}
            <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-indigo-900">
                  {getRoleDescription(user.role)}
                </p>
              </div>
            </div>

            {/* Liste des permissions */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Permissions accordées :
              </p>
              <ul className="space-y-2">
                {getPermissions(user.role).map((permission, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{permission}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avertissement si pas SUPER_ADMIN */}
            {user.role !== UserRole.SUPER_ADMIN && (
              <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      Accès restreint au Dashboard SaaS
                    </p>
                    <p className="text-sm text-amber-800">
                      Le dashboard SaaS avec les métriques globales (MRR, ARR,
                      taux d'engagement, etc.) nécessite le rôle{" "}
                      <strong>SUPER_ADMIN</strong>. Contactez un administrateur
                      système si vous avez besoin d'y accéder.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message positif si SUPER_ADMIN */}
            {user.role === UserRole.SUPER_ADMIN && (
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Accès complet
                    </p>
                    <p className="text-sm text-green-800">
                      Vous avez accès à toutes les fonctionnalités de la
                      plateforme, y compris le dashboard SaaS avec les métriques
                      globales et la gestion complète de tous les hôtels.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
