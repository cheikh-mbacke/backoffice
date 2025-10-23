// src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  Shield,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients (Hôtels)", href: "/hotels", icon: Building2 },
  { name: "Admins Hôtels", href: "/users", icon: Users },
  { name: "Documentation", href: "/documentation", icon: BookOpen },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

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

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800 px-6">
        <h1 className="text-xl font-bold">ConsignesPro Back Office</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-800 p-4 space-y-2">
        {/* Lien vers le profil */}
        <Link
          to="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            location.pathname === "/profile"
              ? "bg-gray-800 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
            <span className="text-sm font-semibold">
              {user?.firstName?.[0]?.toUpperCase()}
              {user?.lastName?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">
              {user?.firstName
                ? user.firstName.charAt(0).toUpperCase() +
                  user.firstName.slice(1).toLowerCase()
                : ""}{" "}
              {user?.lastName}
            </p>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              <span className="text-xs">{getRoleLabel(user?.role)}</span>
            </div>
          </div>
        </Link>

        <Button
          onClick={() => logout()}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
