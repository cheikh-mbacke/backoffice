// src/pages/hotels/HotelDetailsPage.tsx
// import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  Users,
  Activity,
  HardDrive,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SubscriptionStatus } from "@/types";
import { useHotel } from "@/hooks/useHotels";

// Couleurs pour les statuts et plans
const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  TRIAL: "bg-blue-100 text-blue-800",
  SUSPENDED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const planColors = {
  FREE: "bg-gray-100 text-gray-800",
  STARTER: "bg-blue-100 text-blue-800",
  PROFESSIONAL: "bg-purple-100 text-purple-800",
  ENTERPRISE: "bg-gold-100 text-gold-800",
};

export function HotelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: hotel, isLoading, error } = useHotel(id || "");

  if (isLoading) {
    return (
      <div>
        <Header title="Détails du Client" />
        <div className="p-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des données de l'hôtel...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Détails du Client" />
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des données de l'hôtel</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error
                ? error.message
                : "Une erreur inconnue s'est produite"}
            </p>
            <Button
              onClick={() => navigate("/hotels")}
              className="mt-4"
              variant="outline"
            >
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div>
        <Header title="Détails du Client" />
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Hôtel non trouvé</p>
            <Button
              onClick={() => navigate("/hotels")}
              className="mt-4"
              variant="outline"
            >
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case SubscriptionStatus.TRIAL:
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case SubscriptionStatus.SUSPENDED:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case SubscriptionStatus.CANCELLED:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div>
      <Header title="Détails du Client" />
      <div className="p-6">
        {/* Header avec retour */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/hotels")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{hotel.name}</h1>
            <p className="text-muted-foreground">{hotel.address}</p>
          </div>
        </div>

        {/* Informations générales */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statut</CardTitle>
              {getStatusIcon(hotel.status)}
            </CardHeader>
            <CardContent>
              <Badge className={statusColors[hotel.status]}>
                {hotel.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className={planColors[hotel.subscriptionPlan]}>
                {hotel.subscriptionPlan}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hotel._count?.users || 0} / {hotel.maxUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                {hotel._count?.activeUsers || 0} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stockage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hotel._count?.shiftLogs || 0} MB
              </div>
              <p className="text-xs text-muted-foreground">
                / {hotel.maxStorageMB} MB
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Onglet Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hotel.contactName && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{hotel.contactName}</span>
                    </div>
                  )}
                  {hotel.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{hotel.contactEmail}</span>
                    </div>
                  )}
                  {hotel.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{hotel.contactPhone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Détails de l'Abonnement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Début:{" "}
                      {hotel.subscriptionStartDate
                        ? format(
                            new Date(hotel.subscriptionStartDate),
                            "dd MMMM yyyy",
                            { locale: fr }
                          )
                        : "Non défini"}
                    </span>
                  </div>
                  {hotel.subscriptionEndDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Fin:{" "}
                        {format(
                          new Date(hotel.subscriptionEndDate),
                          "dd MMMM yyyy",
                          { locale: fr }
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Dernière activité:{" "}
                      {hotel.lastActivityAt
                        ? format(
                            new Date(hotel.lastActivityAt),
                            "dd MMMM yyyy à HH:mm",
                            { locale: fr }
                          )
                        : "Jamais"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques d'Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {hotel._count?.users || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Utilisateurs totaux
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {hotel._count?.activeUsers || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Utilisateurs actifs
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {hotel._count?.shiftLogs || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Consignes créées
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Utilisateurs */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs de cet Hôtel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Liste des utilisateurs ADMIN et STAFF de cet hôtel.
                  <br />
                  <em>
                    Fonctionnalité à implémenter : affichage des utilisateurs
                    avec leurs rôles et dernières connexions.
                  </em>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Activité */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Graphiques d'activité et historique des consignes.
                  <br />
                  <em>
                    Fonctionnalité à implémenter : graphiques d'activité, nombre
                    de consignes par jour/semaine.
                  </em>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration du Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">
                      Limite d'utilisateurs
                    </label>
                    <p className="text-2xl font-bold">{hotel.maxUsers}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Limite de stockage
                    </label>
                    <p className="text-2xl font-bold">
                      {hotel.maxStorageMB} MB
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline">Modifier les paramètres</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
