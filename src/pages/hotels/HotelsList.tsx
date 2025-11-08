// src/pages/Hotels/HotelsList.tsx
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Eye,
  Ban,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useHotels } from "@/hooks/useHotels";
import { Badge } from "@/components/ui/badge";
import { SubscriptionStatus, Hotel } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { HotelFormDialog } from "./HotelFormDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Couleurs pour les statuts et plans - Compatible mode sombre
const statusColors: Record<SubscriptionStatus, string> = {
  ACTIVE:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  SUSPENDED:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
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

export function HotelsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const {
    hotels,
    pagination,
    isLoading,
    updateHotel,
    deleteHotel,
    isDeleting,
    isUpdating,
  } = useHotels(page, 10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [deletingHotel, setDeletingHotel] = useState<Hotel | null>(null);

  const handleDelete = () => {
    if (deletingHotel) {
      deleteHotel(deletingHotel.id);
      setDeletingHotel(null);
    }
  };

  const handleToggleStatus = (hotel: Hotel) => {
    const newStatus =
      hotel.status === SubscriptionStatus.ACTIVE
        ? SubscriptionStatus.SUSPENDED
        : SubscriptionStatus.ACTIVE;

    updateHotel({ id: hotel.id, data: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Hôtels" />
        <div className="p-4 sm:p-6 flex items-center justify-center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Hôtels" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Hôtels</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gérez vos hôtels et leurs abonnements
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="sm:size-default"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Ajouter un Hôtel</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>

        {/* Vue Desktop - Table */}
        <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de l'Hôtel</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Dernière Activité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Aucun hôtel trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  hotels.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        <Link
                          to={`/hotels/${hotel.id}`}
                          className="block hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors"
                        >
                          <div className="font-semibold hover:underline truncate">
                            {hotel.name}
                          </div>
                          {hotel.address && (
                            <div className="text-sm text-muted-foreground truncate">
                              {hotel.address}
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={planColors[hotel.subscriptionPlan]}
                        >
                          {hotel.subscriptionPlan}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={statusColors[hotel.status]}
                        >
                          {hotel.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{hotel._count?.users || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {hotel.lastActivityAt ? (
                          <div className="text-sm">
                            {format(
                              new Date(hotel.lastActivityAt),
                              "dd/MM/yyyy",
                              {
                                locale: fr,
                              }
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Jamais</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    navigate(`/hotels/${hotel.id}`)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Voir les détails</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Bouton Suspendre/Activer avec loading state */}
                          {(hotel.status === SubscriptionStatus.ACTIVE ||
                            hotel.status === SubscriptionStatus.SUSPENDED) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleStatus(hotel)}
                                    disabled={isUpdating}
                                    className={
                                      hotel.status === SubscriptionStatus.ACTIVE
                                        ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20"
                                        : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                                    }
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : hotel.status ===
                                      SubscriptionStatus.ACTIVE ? (
                                      <Ban className="h-4 w-4" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {hotel.status === SubscriptionStatus.ACTIVE
                                      ? "Suspendre l'hôtel"
                                      : "Réactiver l'hôtel"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingHotel(hotel)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Modifier</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingHotel(hotel)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Supprimer</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Vue Mobile - Cards */}
        <div className="md:hidden space-y-3">
          {hotels.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              Aucun hôtel trouvé
            </div>
          ) : (
            hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="rounded-lg border bg-card overflow-hidden"
              >
                {/* En-tête de la carte - Cliquable pour voir les détails */}
                <Link
                  to={`/hotels/${hotel.id}`}
                  className="block p-4 hover:bg-muted/50 transition-colors active:bg-muted"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">
                        {hotel.name}
                      </h3>
                      {hotel.address && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {hotel.address}
                        </p>
                      )}
                    </div>
                    <Eye className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusColors[hotel.status]}
                    >
                      {hotel.status}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={planColors[hotel.subscriptionPlan]}
                    >
                      {hotel.subscriptionPlan}
                    </Badge>
                  </div>
                </Link>

                {/* Informations détaillées */}
                <div className="px-4 pb-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Utilisateurs</span>
                    </div>
                    <span className="font-medium">
                      {hotel._count?.users || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-muted-foreground">
                      Dernière activité
                    </span>
                    <span className="font-medium">
                      {hotel.lastActivityAt
                        ? format(new Date(hotel.lastActivityAt), "dd/MM/yyyy", {
                            locale: fr,
                          })
                        : "Jamais"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t bg-muted/30 p-3 flex items-center justify-end gap-2">
                  {(hotel.status === SubscriptionStatus.ACTIVE ||
                    hotel.status === SubscriptionStatus.SUSPENDED) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(hotel)}
                      disabled={isUpdating}
                      className={
                        hotel.status === SubscriptionStatus.ACTIVE
                          ? "text-orange-600 hover:text-orange-700 border-orange-300 dark:text-orange-400 dark:hover:text-orange-300 dark:border-orange-600"
                          : "text-green-600 hover:text-green-700 border-green-300 dark:text-green-400 dark:hover:text-green-300 dark:border-green-600"
                      }
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : hotel.status === SubscriptionStatus.ACTIVE ? (
                        <>
                          <Ban className="h-4 w-4 mr-1.5" />
                          Suspendre
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Activer
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingHotel(hotel)}
                  >
                    <Pencil className="h-4 w-4 mr-1.5" />
                    Modifier
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingHotel(hotel)}
                    className="text-destructive hover:text-destructive border-destructive/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Page {pagination.page} sur {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <HotelFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        hotel={null}
      />

      <HotelFormDialog
        open={!!editingHotel}
        onOpenChange={(open) => !open && setEditingHotel(null)}
        hotel={editingHotel}
      />

      <AlertDialog
        open={!!deletingHotel}
        onOpenChange={(open) => !open && setDeletingHotel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'hôtel "{deletingHotel?.name}"
              sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
