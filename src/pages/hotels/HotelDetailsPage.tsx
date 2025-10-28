// src/pages/hotels/HotelDetailsPage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Building2,
  Users,
  Activity,
  FileText,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SubscriptionStatus, HotelUser } from "@/types";
import { useHotel, useHotelUsers } from "@/hooks/useHotels";

// Couleurs pour les statuts et plans - Compatible mode sombre
const statusColors = {
  ACTIVE:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  TRIAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const planColors = {
  FREE: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  TRIAL: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  STARTER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PROFESSIONAL:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ENTERPRISE:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export function HotelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [usersPage, setUsersPage] = useState(1);

  const { data: hotel, isLoading, error } = useHotel(id || "");
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useHotelUsers(id || "", usersPage, 10);

  if (isLoading) {
    return (
      <div>
        <Header title="Détails de l'Hôtel" />
        <div className="p-4 sm:p-6 flex items-center justify-center">
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
        <Header title="Détails de l'Hôtel" />
        <div className="p-4 sm:p-6">
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
        <Header title="Détails de l'Hôtel" />
        <div className="p-4 sm:p-6">
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
      <Header title="Détails de l'Hôtel" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header avec retour */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/hotels")}
            className="flex items-center gap-2 self-start"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour à la liste</span>
            <span className="sm:hidden">Retour</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{hotel.name}</h1>
            <p className="text-sm text-muted-foreground">{hotel.address}</p>
          </div>
        </div>

        {/* Informations générales */}
        <div className="mb-4 sm:mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
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
                Utilisateurs totaux
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hotel._count?.users || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Tous les utilisateurs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs actifs
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hotel._count?.activeUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Actifs (30 derniers jours)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consignes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hotel._count?.shiftLogs || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total créées</p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          {/* Onglet Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
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
          </TabsContent>

          {/* Onglet Utilisateurs */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Utilisateurs de cet Hôtel
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Liste des utilisateurs ADMIN et STAFF avec leurs activités
                  récentes
                </p>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : usersError ? (
                  <div className="text-center py-8 text-red-600">
                    <p>Erreur lors du chargement des utilisateurs</p>
                  </div>
                ) : !usersData?.data?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun utilisateur trouvé pour cet hôtel</p>
                  </div>
                ) : (
                  <>
                    {/* Vue Desktop - Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table className="min-w-[800px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Fonction</TableHead>
                            <TableHead>Dernière connexion</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usersData?.data?.map((user: HotelUser) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium whitespace-nowrap">
                                {user.firstName} {user.lastName || ""}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {user.email}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge
                                  variant={
                                    user.role === "ADMIN"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {user.position || (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {user.lastLogin ? (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm">
                                      {format(
                                        new Date(user.lastLogin),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: fr }
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    Jamais
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Vue Mobile - Cards */}
                    <div className="md:hidden space-y-3">
                      {usersData?.data?.map((user: HotelUser) => (
                        <div
                          key={user.id}
                          className="rounded-lg border bg-card overflow-hidden"
                        >
                          {/* En-tête de la carte */}
                          <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base">
                                  {user.firstName} {user.lastName || ""}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate mt-0.5">
                                  {user.email}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  user.role === "ADMIN"
                                    ? "default"
                                    : "secondary"
                                }
                                className="flex-shrink-0"
                              >
                                {user.role}
                              </Badge>
                            </div>
                          </div>

                          {/* Informations détaillées */}
                          <div className="px-4 py-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between py-2 border-b">
                              <span className="text-muted-foreground">
                                Fonction
                              </span>
                              <span className="font-medium text-right">
                                {user.position || (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Dernière connexion</span>
                              </div>
                              <span className="font-medium text-right">
                                {user.lastLogin ? (
                                  format(
                                    new Date(user.lastLogin),
                                    "dd/MM/yyyy",
                                    { locale: fr }
                                  )
                                ) : (
                                  <span className="text-muted-foreground">
                                    Jamais
                                  </span>
                                )}
                              </span>
                            </div>

                            {user.lastLogin && (
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(user.lastLogin), "HH:mm", {
                                  locale: fr,
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {usersData.pagination &&
                      usersData.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-muted-foreground">
                            Page {usersData.pagination.page} sur{" "}
                            {usersData.pagination.totalPages} (
                            {usersData.pagination.total} utilisateurs au total)
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setUsersPage((p) => Math.max(1, p - 1))
                              }
                              disabled={usersData.pagination.page === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setUsersPage((p) => p + 1)}
                              disabled={
                                usersData.pagination.page ===
                                usersData.pagination.totalPages
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
