// src/pages/Hotels/HotelsList.tsx
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Users,
  HardDrive,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHotels } from "@/hooks/useHotels";
import { Badge } from "@/components/ui/badge";
import { SubscriptionStatus, SubscriptionPlan, Hotel } from "@/types";
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
        <div className="flex items-center justify-center p-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Hôtels" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Clients (Hôtels)</h2>
            <p className="text-sm text-muted-foreground">
              Gérez vos clients hôtels et leurs abonnements
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un Client
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de l'Hôtel</TableHead>
                <TableHead>Plan & Statut</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead>Stockage</TableHead>
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
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              ) : (
                hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{hotel.name}</div>
                        {hotel.address && (
                          <div className="text-sm text-muted-foreground">
                            {hotel.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className={planColors[hotel.subscriptionPlan]}
                        >
                          {hotel.subscriptionPlan}
                        </Badge>
                        <div>
                          <Badge
                            variant="outline"
                            className={statusColors[hotel.status]}
                          >
                            {hotel.status}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {hotel._count?.users || 0} / {hotel.maxUsers}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {hotel._count?.shiftLogs || 0} MB /{" "}
                          {hotel.maxStorageMB} MB
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/hotels/${hotel.id}`)}
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Bouton Suspendre/Activer */}
                        {(hotel.status === SubscriptionStatus.ACTIVE ||
                          hotel.status === SubscriptionStatus.SUSPENDED) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(hotel)}
                            title={
                              hotel.status === SubscriptionStatus.ACTIVE
                                ? "Suspendre le client"
                                : "Réactiver le client"
                            }
                            className={
                              hotel.status === SubscriptionStatus.ACTIVE
                                ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            }
                          >
                            {hotel.status === SubscriptionStatus.ACTIVE ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingHotel(hotel)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingHotel(hotel)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
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
