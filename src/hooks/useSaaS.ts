// src/hooks/useSaaS.ts
import { useQuery } from "@tanstack/react-query";
import { saasService } from "../services/saas.service";
// import { SaaSStats, HotelActivity } from "../types";

export const useSaaSStats = () => {
  return useQuery({
    queryKey: ["saas", "stats"],
    queryFn: async () => {
      console.log("📊 [useSaaSStats] Appel de l'API /saas/stats...");
      try {
        const result = await saasService.getStats();
        console.log(
          "✅ [useSaaSStats] Données récupérées avec succès:",
          result
        );
        return result;
      } catch (error) {
        console.error("❌ [useSaaSStats] Erreur lors de l'appel API:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEngagementMetrics = (period: "7d" | "30d" | "90d" = "30d") => {
  return useQuery({
    queryKey: ["saas", "engagement", period],
    queryFn: () => saasService.getEngagementMetrics(period),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHotelActivity = (hotelId: string) => {
  return useQuery({
    queryKey: ["saas", "hotel-activity", hotelId],
    queryFn: () => saasService.getHotelActivity(hotelId),
    enabled: !!hotelId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useActivityChartData = (period: "7d" | "30d" | "90d" = "30d") => {
  return useQuery({
    queryKey: ["saas", "activity-chart", period],
    queryFn: () => saasService.getActivityChartData(period),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinancialChartData = (period: "6m" | "12m" = "6m") => {
  return useQuery({
    queryKey: ["saas", "financial-chart", period],
    queryFn: () => saasService.getFinancialChartData(period),
    staleTime: 5 * 60 * 1000,
  });
};