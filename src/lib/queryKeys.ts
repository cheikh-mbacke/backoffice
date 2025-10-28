// src/lib/queryKeys.ts
/**
 * Centralization des query keys pour React Query
 * Ceci permet d'éviter les doublons et de maintenir la cohérence
 */

export const queryKeys = {
  // Authentication & Current User
  auth: {
    currentUser: ["auth", "currentUser"] as const,
    availableProfiles: ["auth", "availableProfiles"] as const,
  },

  // Users
  users: {
    all: (page?: number, limit?: number) =>
      page && limit ? (["users", page, limit] as const) : (["users"] as const),
    detail: (id: string) => ["users", "detail", id] as const,
    byHotel: (hotelId: string, page?: number, limit?: number) =>
      page && limit
        ? (["users", "hotel", hotelId, page, limit] as const)
        : (["users", "hotel", hotelId] as const),
  },

  // Profiles
  profiles: {
    all: (page?: number, limit?: number) =>
      page && limit
        ? (["profiles", page, limit] as const)
        : (["profiles"] as const),
    detail: (id: string) => ["profiles", "detail", id] as const,
    byUser: (userId: string) => ["profiles", "user", userId] as const,
    // Alias pour la compatibilité avec l'ancien système
    userProfiles: ["profiles", "current-user"] as const,
  },

  // Hotels
  hotels: {
    all: (page?: number, limit?: number) =>
      page && limit
        ? (["hotels", page, limit] as const)
        : (["hotels"] as const),
    detail: (id: string) => ["hotels", "detail", id] as const,
    users: (id: string, page?: number, limit?: number) =>
      page && limit
        ? (["hotels", id, "users", page, limit] as const)
        : (["hotels", id, "users"] as const),
  },

  // SaaS Metrics
  saas: {
    stats: ["saas", "stats"] as const,
    engagement: (period: string) => ["saas", "engagement", period] as const,
    activityChart: (period: string) =>
      ["saas", "activity-chart", period] as const,
    financialChart: (period: string) =>
      ["saas", "financial-chart", period] as const,
  },
} as const;

/**
 * Fonction utilitaire pour invalider tous les caches liés à l'utilisateur courant
 * À utiliser après login, logout, sélection de profil, etc.
 */
export const invalidateCurrentUserData = (queryClient: any) => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.auth.availableProfiles,
    }),
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.userProfiles }),
  ]);
};

/**
 * Fonction utilitaire pour invalider tous les caches liés aux profils
 * À utiliser après création, modification ou suppression de profil
 */
export const invalidateProfilesData = (queryClient: any, userId?: string) => {
  const promises = [
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all() }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.auth.availableProfiles,
    }),
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.userProfiles }),
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
  ];

  if (userId) {
    promises.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.byUser(userId) })
    );
  }

  return Promise.all(promises);
};

/**
 * Fonction utilitaire pour invalider tous les caches SaaS
 * À utiliser après création/modification/suppression d'hôtel ou utilisateur
 */
export const invalidateSaasData = (queryClient: any) => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.saas.stats }),
    queryClient.invalidateQueries({ queryKey: ["saas", "activity-chart"] }),
    queryClient.invalidateQueries({ queryKey: ["saas", "financial-chart"] }),
    queryClient.invalidateQueries({ queryKey: ["saas", "engagement"] }),
  ]);
};

/**
 * Fonction utilitaire pour invalider tous les caches liés aux utilisateurs
 * À utiliser après création/modification/suppression d'utilisateur
 */
export const invalidateUsersData = (queryClient: any, hotelId?: string) => {
  const promises = [
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
    invalidateSaasData(queryClient),
  ];

  if (hotelId) {
    promises.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.byHotel(hotelId),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.users(hotelId) })
    );
  }

  return Promise.all(promises);
};

/**
 * Fonction utilitaire pour invalider tous les caches liés aux hôtels
 * À utiliser après création/modification/suppression d'hôtel
 */
export const invalidateHotelsData = (queryClient: any) => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all() }),
    invalidateSaasData(queryClient),
  ]);
};

