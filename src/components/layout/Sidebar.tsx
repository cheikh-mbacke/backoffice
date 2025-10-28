// src/components/layout/Sidebar.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  Shield,
  X,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateCurrentUserData } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSelectionDialog } from "@/components/auth/ProfileSelectionDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { profilePhotosService } from "@/services/profilePhotos.service";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Hôtels", href: "/hotels", icon: Building2 },
  { name: "Admins Hôtels", href: "/users", icon: Users },
  { name: "Mes Profils", href: "/profiles", icon: UserIcon },
  { name: "Mon Compte", href: "/account", icon: Shield },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [showProfileSelection, setShowProfileSelection] = useState(false);

  // Fonction pour obtenir le label du rôle (simplifié)
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      case "STAFF":
        return "Staff";
      default:
        return "Inconnu";
    }
  };

  const handleProfileSelected = async () => {
    setShowProfileSelection(false);
    // Invalider le cache pour forcer le rechargement des données utilisateur
    await invalidateCurrentUserData(queryClient);
  };

  const handleProfileDialogOpenChange = (open: boolean) => {
    setShowProfileSelection(open);
  };

  const displayName =
    user?.currentProfileName ||
    (user ? `${user.firstName} ${user.lastName}` : "Utilisateur");
  const displayRole = user?.currentProfileRole || user?.role;
  const hasProfile = !!user?.currentProfileId;

  return (
    <>
      <ProfileSelectionDialog
        open={showProfileSelection}
        onProfileSelected={handleProfileSelected}
        onOpenChange={handleProfileDialogOpenChange}
      />

      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-gray-900 dark:bg-gray-800 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo avec bouton fermeture mobile */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <h1 className="text-lg font-bold lg:text-xl">ConsignesPro BO</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-800 dark:bg-gray-700 text-white"
                    : "text-gray-300 dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-800 p-4 space-y-2">
          {/* Affichage du profil actuel avec possibilité de changer */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowProfileSelection(true)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    "text-gray-300 dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 overflow-hidden">
                    {hasProfile && user?.currentProfileAvatarUrl ? (
                      (() => {
                        const avatarUrl =
                          profilePhotosService.getProfilePhotoUrl(
                            user.currentProfileAvatarUrl
                          );
                        return (
                          <img
                            src={avatarUrl || ""}
                            alt={`Photo de ${displayName}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback vers l'icône si l'image ne charge pas
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        );
                      })()
                    ) : hasProfile ? (
                      <UserIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">
                        {user?.firstName?.[0]?.toUpperCase()}
                        {user?.lastName?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0 text-left">
                    <p className="truncate text-sm font-medium">
                      {displayName}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs truncate">
                        {getRoleLabel(displayRole)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  {hasProfile ? "Changer de profil" : "Sélectionner un profil"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Bouton de déconnexion */}
          <Button
            onClick={() => logout()}
            variant="ghost"
            className="w-full justify-start text-gray-300 dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
}
