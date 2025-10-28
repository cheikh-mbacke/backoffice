// src/services/saas.service.ts
import api from "@/config/api";
import { SaaSStats } from "@/types";

export const saasService = {
  /**
   * Récupérer les statistiques globales du dashboard SaaS
   */
  async getStats(): Promise<SaaSStats> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      totalHotels: number;
      activeHotels: number;
      trialHotels: number;
      suspendedHotels: number;
      totalUsers: number;
      activeUsers: number;
      mrr: number;
      arr: number;
      engagementRate: number;
      retentionRate: number;
      churnRate: number;
      activeHotelsTrend?: string;
      mrrTrend?: string;
      engagementTrend?: string;
      retentionTrend?: string;
      planCounts: {
        free: number;
        trial: number;
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
    }>("/saas/stats");
    return response.data;
  },

  /**
   * Récupérer les métriques d'engagement sur une période
   */
  async getEngagementMetrics(period: "7d" | "30d" | "90d" = "30d"): Promise<{
    engagementRate: number;
    activeUsers: number;
    totalUsers: number;
  }> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      engagementRate: number;
      activeUsers: number;
      totalUsers: number;
    }>("/saas/engagement", {
      params: { period },
    });
    return {
      engagementRate: response.data.engagementRate,
      activeUsers: response.data.activeUsers,
      totalUsers: response.data.totalUsers,
    };
  },

  /**
   * Récupérer les données pour les graphiques d'activité
   */
  async getActivityChartData(period: "7d" | "30d" | "90d" = "30d"): Promise<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  }> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
      }>;
    }>("/saas/activity-chart", {
      params: { period },
    });
    return {
      labels: response.data.labels,
      datasets: response.data.datasets,
    };
  },

  /**
   * Récupérer les données pour les graphiques financiers (MRR/ARR)
   */
  async getFinancialChartData(period: "6m" | "12m" = "6m"): Promise<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  }> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
      }>;
    }>("/saas/financial-chart", {
      params: { period },
    });
    return {
      labels: response.data.labels,
      datasets: response.data.datasets,
    };
  },
};
