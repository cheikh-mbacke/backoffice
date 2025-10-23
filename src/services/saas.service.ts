// src/services/saas.service.ts
import api from "@/config/api";
import { SaaSStats, HotelActivity } from "@/types";

export const saasService = {
  /**
   * Récupérer les statistiques globales du dashboard SaaS
   */
  async getStats(): Promise<SaaSStats> {
    const response = await api.get("/saas/stats");
    return response.data; // L'API retourne directement les stats dans data
  },

  /**
   * Récupérer les métriques d'engagement sur une période
   */
  async getEngagementMetrics(period: "7d" | "30d" | "90d" = "30d"): Promise<{
    engagementRate: number;
    activeUsers: number;
    totalUsers: number;
  }> {
    const response = await api.get("/saas/engagement", {
      params: { period },
    });
    return response.data;
  },

  /**
   * Récupérer l'activité d'un hôtel spécifique
   */
  async getHotelActivity(hotelId: string): Promise<HotelActivity> {
    const response = await api.get(`/saas/hotels/${hotelId}/activity`);
    return response.data;
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
    const response = await api.get("/saas/activity-chart", {
      params: { period },
    });
    return response.data;
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
    const response = await api.get("/saas/financial-chart", {
      params: { period },
    });
    return response.data;
  },
};
