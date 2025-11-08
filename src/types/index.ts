// src/types/index.ts

export const UserRole = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  STAFF: "STAFF",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  hotelId: string | null;
  phone?: string;
  position?: string;
  isDefault?: boolean; // Compte par défaut (ne peut pas être supprimé)
  createdAt: string;
  updatedAt: string;
  hotel?: Hotel; // Relation pour afficher le nom de l'hôtel

  // SYSTÈME DE PROFILS NETFLIX-LIKE
  currentProfileId?: string; // ID du profil actuellement sélectionné
  currentProfileName?: string; // Nom du profil pour affichage rapide
  currentProfileRole?: UserRole; // Rôle du profil actuel
  currentProfileAvatarUrl?: string; // URL de la photo du profil actuel
}

// Types SaaS
export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
} as const;

export const SubscriptionPlan = {
  FREE: "FREE",
  TRIAL: "TRIAL",
  STARTER: "STARTER",
  PROFESSIONAL: "PROFESSIONAL",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
export type SubscriptionPlan =
  (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export interface Hotel {
  id: string;
  name: string;
  address?: string;

  // CHAMPS SaaS complets
  status: SubscriptionStatus; // Statut du compte
  subscriptionPlan: SubscriptionPlan; // Plan tarifaire
  subscriptionStartDate: string; // Date de début d'abonnement
  subscriptionEndDate?: string; // Date de fin (si trial ou résiliation)

  // Contact principal
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string; // Dernière activité sur la plateforme

  // Stats (calculées côté backend)
  _count?: {
    users: number;
    shiftLogs: number;
    activeUsers: number; // Users connectés dans les 30 derniers jours
  };
}

export interface Profile {
  id: string;
  name: string;
  userId: string;
  hotelId: string;
  role: UserRole;
  isActive: boolean;
  isDefault: boolean;
  avatarUrl?: string; // URL de la photo de profil
  createdAt: string;
  updatedAt: string;
  user?: User;
  hotel?: Hotel;
}

export interface AuthResponse {
  status: string;
  message: string;
  timestamp: string;
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: UserRole;
  hotelId: string | null;
  phone?: string;
  position?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Informations du profil actuel
  currentProfileId?: string | null;
  currentProfileName?: string | null;
  currentProfileRole?: UserRole | null;
  currentProfileAvatarUrl?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  status: "success" | "failed";
  message?: string;
  timestamp: string;
  data?: T;
}

export interface ApiErrorResponse {
  status: "failed";
  errorCode: number;
  errorName: string;
  errorMessage: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  status: "success";
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface CreateHotelDto {
  name: string;
  address?: string;

  // CHAMPS SaaS complets
  subscriptionPlan: SubscriptionPlan;

  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateHotelDto {
  name?: string;
  address?: string;

  // CHAMPS SaaS complets
  status?: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;

  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  hotelId?: string | null;
  phone?: string; // NOUVEAU
  position?: string; // NOUVEAU
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  hotelId?: string | null;
  phone?: string; // NOUVEAU
  position?: string; // NOUVEAU
  isDefault?: boolean; // NOUVEAU
}

export interface CreateProfileDto {
  name: string;
  userId: string;
  hotelId: string;
  role: UserRole;
  isDefault?: boolean;
}

export interface UpdateProfileDto {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
  isDefault?: boolean;
}

// ===================================
// Types SaaS pour le Dashboard
// ===================================

export interface SaaSStats {
  totalHotels: number;
  activeHotels: number;
  trialHotels: number;
  suspendedHotels: number;

  totalUsers: number;
  activeUsers: number; // Connectés dans les 30 derniers jours

  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue

  engagementRate: number; // % users actifs
  retentionRate: number; // % hôtels qui restent après 90 jours
  churnRate: number; // % hôtels qui partent

  // Tendances calculées dynamiquement
  activeHotelsTrend?: string;
  mrrTrend?: string;
  engagementTrend?: string;
  retentionTrend?: string;

  planCounts: {
    free: number;
    starter: number;
    professional: number;
    enterprise: number;
  };

  lowActivityHotels: Array<{
    id: string;
    name: string;
    lastActivityDays: number;
  }>;
  endingTrials: Array<{ id: string; name: string; daysLeft: number }>;
  overLimitHotels: Array<{ id: string; name: string; limitType: string }>;
}

export interface HotelActivity {
  hotelId: string;
  period: string;
  shiftLogsCreated: number;
  activeUsers: number;
  avgResolutionTime: number; // en heures
  engagementScore: number; // 0-100
}

export interface SystemHealth {
  status: "operational" | "degraded" | "down";
  api: {
    status: string;
    uptime: number;
    avgResponseTime: number;
  };
  database: {
    status: string;
    connections: number;
    maxConnections: number;
    avgQueryTime: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Types pour les utilisateurs d'un hôtel
export interface HotelUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  phone?: string;
  position?: string;
  createdAt: string;
  lastLogin?: string;
  shiftLogsCount: number; // Nombre de consignes créées (30 derniers jours)
}
