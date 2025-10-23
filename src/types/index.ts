// src/types/index.ts

export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  hotelId: string | null;
  phone?: string; // NOUVEAU
  position?: string; // NOUVEAU
  createdAt: string;
  updatedAt: string;
  hotel?: Hotel; // Relation pour afficher le nom de l'hôtel
}

// Types SaaS
export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  TRIAL: "TRIAL",
  SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
} as const;

export const SubscriptionPlan = {
  FREE: "FREE",
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

  // NOUVEAUX CHAMPS SaaS
  status: SubscriptionStatus; // Statut du compte
  subscriptionPlan: SubscriptionPlan; // Plan tarifaire
  subscriptionStartDate: string; // Date de début d'abonnement
  subscriptionEndDate?: string; // Date de fin (si trial ou résiliation)
  maxUsers: number; // Limite d'utilisateurs selon le plan
  maxStorageMB: number; // Limite de stockage fichiers

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
  lastName: string;
  email: string;
  role: UserRole;
  hotelId: string | null;
  createdAt?: string;
  updatedAt?: string;
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

  // NOUVEAUX CHAMPS SaaS
  subscriptionPlan: SubscriptionPlan;
  maxUsers: number;
  maxStorageMB: number;

  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateHotelDto {
  name?: string;
  address?: string;

  // NOUVEAUX CHAMPS SaaS
  status?: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;
  maxUsers?: number;
  maxStorageMB?: number;

  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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
