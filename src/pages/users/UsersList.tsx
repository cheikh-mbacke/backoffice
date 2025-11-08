// src/pages/Users/UsersList.tsx
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Building2, KeyRound } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useHotels } from "@/hooks/useHotels";
import { User } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { UserFormDialog } from "./UserFormDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserRole } from "@/types";

// Filtrage pour ne garder que les MANAGER d'hôtels
const getHotelManagers = (users: User[]) => {
  return users.filter((user) => user.role === UserRole.MANAGER);
};

export function UsersListPage() {
  const [page, setPage] = useState(1);
  const { users, pagination, isLoading, deleteUser, isDeleting } = useUsers(
    page,
    10
  );
  const { hotels } = useHotels(1, 100); // Récupérer tous les hôtels
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(
    null
  );

  // Filtrer pour ne garder que les MANAGER d'hôtels
  const hotelManagers = getHotelManagers(users);

  // Fonction pour obtenir le nom de l'hôtel par son ID
  const getHotelName = (hotelId: string | null) => {
    if (!hotelId) return "Non assigné";
    const hotel = hotels.find((h) => h.id === hotelId);
    return hotel?.name || "Hôtel non trouvé";
  };

  // Fonction pour vérifier si un utilisateur est l'admin par défaut de son hôtel
  const isDefaultManager = (user: User) => {
    if (user.role !== UserRole.MANAGER || !user.hotelId) return false;

    // Trouver le premier admin créé pour cet hôtel (le plus ancien)
    const hotelManagersForThisHotel = hotelManagers.filter(
      (manager) => manager.hotelId === user.hotelId
    );

    if (hotelManagersForThisHotel.length === 0) return false;

    // Trier par date de création et prendre le plus ancien
    const oldestManager = hotelManagersForThisHotel.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];

    return oldestManager.id === user.id;
  };

  const handleDelete = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Managers d'Hôtels" />
        <div className="p-4 sm:p-6 flex items-center justify-center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Managers d'Hôtels" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Managers des Hôtels
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gérez les managers d'hôtels (vos contacts principaux)
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="sm:size-default"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              Ajouter un Manager d'Hôtel
            </span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>

        {/* Vue Desktop - Table */}
        <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Hôtel</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotelManagers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Aucun manager d'hôtel trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  hotelManagers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {user.firstName} {user.lastName || ""}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {user.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">
                            {getHotelName(user.hotelId)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          Manager d'Hôtel
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(user.createdAt), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingUser(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Modifier les informations</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setChangingPasswordUser(user)}
                              >
                                <KeyRound className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Changer le mot de passe</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingUser(user)}
                                disabled={isDefaultManager(user)}
                                className={
                                  isDefaultManager(user)
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {isDefaultManager(user)
                                  ? "Impossible de supprimer le manager par défaut de l'hôtel"
                                  : "Supprimer l'utilisateur"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
          {hotelManagers.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              Aucun manager d'hôtel trouvé
            </div>
          ) : (
            hotelManagers.map((user) => (
              <div
                key={user.id}
                className="rounded-lg border bg-card overflow-hidden"
              >
                {/* En-tête de la carte */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
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
                      variant="secondary"
                      className="bg-blue-600 text-white dark:bg-blue-500 dark:text-white flex-shrink-0"
                    >
                      Manager
                    </Badge>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="px-4 py-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>Hôtel</span>
                    </div>
                    <span className="font-medium text-right">
                      {getHotelName(user.hotelId)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Créé le</span>
                    <span className="font-medium">
                      {format(new Date(user.createdAt), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>

                  {isDefaultManager(user) && (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>
                        Manager principal de l'hôtel (ne peut être supprimé)
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t bg-muted/30 p-3 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    <Pencil className="h-4 w-4 mr-1.5" />
                    Modifier
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChangingPasswordUser(user)}
                    className="text-blue-600 hover:text-blue-700 border-blue-300 dark:text-blue-400 dark:hover:text-blue-300 dark:border-blue-600"
                  >
                    <KeyRound className="h-4 w-4 mr-1.5" />
                    Mot de passe
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingUser(user)}
                    disabled={isDefaultManager(user)}
                    className={
                      isDefaultManager(user)
                        ? "opacity-50 cursor-not-allowed"
                        : "text-destructive hover:text-destructive border-destructive/30"
                    }
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
      <UserFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        user={null}
      />

      <UserFormDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
      />

      {changingPasswordUser && (
        <ChangePasswordDialog
          open={!!changingPasswordUser}
          onOpenChange={(open) => !open && setChangingPasswordUser(null)}
          user={changingPasswordUser}
        />
      )}

      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingUser && isDefaultManager(deletingUser) ? (
                <div className="text-red-600">
                  <strong>Impossible de supprimer cet utilisateur.</strong>
                  <br />
                  Cet utilisateur est le manager par défaut de l'hôtel "
                  {getHotelName(deletingUser.hotelId)}" et ne peut pas être
                  supprimé pour des raisons de sécurité et de continuité de
                  service.
                </div>
              ) : (
                <>
                  Cette action est irréversible. L'utilisateur "
                  {deletingUser?.firstName} {deletingUser?.lastName || ""}" sera
                  définitivement supprimé.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            {deletingUser && !isDefaultManager(deletingUser) && (
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                Supprimer
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
