// src/hooks/useSaaS.ts
import { useQuery } from "@tanstack/react-query";
import { saasService } from "../services/saas.service";
import { queryKeys } from "@/lib/queryKeys";

export const useSaaSStats = () => {
  return useQuery({
    queryKey: queryKeys.saas.stats,
    queryFn: async () => {
      try {
        const result = await saasService.getStats();
        return result;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEngagementMetrics = (period: "7d" | "30d" | "90d" = "30d") => {
  return useQuery({
    queryKey: queryKeys.saas.engagement(period),
    queryFn: () => saasService.getEngagementMetrics(period),
    staleTime: 5 * 60 * 1000,
  });
};

export const useActivityChartData = (period: "7d" | "30d" | "90d" = "30d") => {
  return useQuery({
    queryKey: queryKeys.saas.activityChart(period),
    queryFn: () => saasService.getActivityChartData(period),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinancialChartData = (period: "6m" | "12m" = "6m") => {
  return useQuery({
    queryKey: queryKeys.saas.financialChart(period),
    queryFn: () => saasService.getFinancialChartData(period),
    staleTime: 5 * 60 * 1000,
  });
};
