// src/pages/Dashboard.tsx
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertTriangle,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { PlanDistributionChart } from "@/components/dashboard/PlanDistributionChart";
import { useNavigate } from "react-router-dom";
import { useSaaSStats } from "@/hooks/useSaaS";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { useState } from "react";
// import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useSaaSStats();

  // États pour gérer l'ouverture/fermeture des sections
  const [openSections, setOpenSections] = useState({
    hotels: false,
    users: false,
    revenue: false,
    performance: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Dashboard SaaS" />
        <div className="p-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des statistiques...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Dashboard SaaS" />
        <div className="p-6 space-y-4">
          {/* Avertissement si l'utilisateur n'est pas SUPER_ADMIN */}
          {user?.role !== UserRole.SUPER_ADMIN && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Accès restreint - Rôle SUPER_ADMIN requis
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                      Le dashboard SaaS n'est accessible qu'aux utilisateurs
                      avec le rôle <strong>SUPER_ADMIN</strong>.
                    </p>
                    <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <p>
                        <strong>Votre rôle actuel :</strong>{" "}
                        <span className="font-mono bg-amber-100 dark:bg-amber-800/50 px-2 py-0.5 rounded text-amber-900 dark:text-amber-100">
                          {user?.role || "Non défini"}
                        </span>
                      </p>
                      <p>
                        <strong>Votre email :</strong>{" "}
                        <span className="font-mono bg-amber-100 dark:bg-amber-800/50 px-2 py-0.5 rounded text-amber-900 dark:text-amber-100">
                          {user?.email}
                        </span>
                      </p>
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-3">
                      Pour accéder au dashboard, veuillez vous connecter avec un
                      compte SUPER_ADMIN ou contactez un administrateur système.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message d'erreur */}
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="text-center text-red-600 dark:text-red-400">
                <p className="font-semibold mb-2">
                  Erreur lors du chargement des statistiques
                </p>
                <p className="text-sm text-red-500 dark:text-red-300">
                  {error instanceof Error
                    ? error.message
                    : "Une erreur inconnue s'est produite"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <Header title="Dashboard SaaS" />
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Aucune donnée disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard SaaS" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* En-tête */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Vue d'ensemble des activités
          </h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Métriques clés pour le suivi de votre business
          </p>
        </div>

        {/* 1. KPIs Principaux - Toujours visibles */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Hôtels Actifs"
            value={stats.activeHotels || 0}
            subtitle={`${stats.totalHotels || 0} au total`}
            trend={stats.activeHotelsTrend || undefined}
            icon={Building2}
            color="blue"
          />

          <StatCard
            title="MRR (Revenu Mensuel)"
            value={`${(stats.mrr || 0).toLocaleString("fr-FR")} €`}
            subtitle="Revenu mensuel récurrent"
            trend={stats.mrrTrend || undefined}
            icon={DollarSign}
            color="green"
          />

          <StatCard
            title="Taux d'Engagement"
            value={`${stats.engagementRate || 0}%`}
            subtitle={`${stats.activeUsers || 0} / ${
              stats.totalUsers || 0
            } actifs`}
            trend={stats.engagementTrend || undefined}
            icon={Activity}
            color="purple"
          />

          <StatCard
            title="Taux de Rétention"
            value={`${stats.retentionRate || 0}%`}
            subtitle="Sur 90 jours"
            trend={stats.retentionTrend || undefined}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* 2. Évolution MRR & Hôtels */}
        <FinancialChart />

        {/* 6. Activité Quotidienne */}
        <ActivityChart />

        {/* 3. Répartition par Plan d'Abonnement */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Répartition par Plan d'Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2">
                <PlanCard plan="FREE" count={stats.planCounts?.free || 0} />
                <PlanCard plan="TRIAL" count={stats.planCounts?.trial || 0} />
                <PlanCard
                  plan="STARTER"
                  count={stats.planCounts?.starter || 0}
                />
                <PlanCard
                  plan="PROFESSIONAL"
                  count={stats.planCounts?.professional || 0}
                />
                <PlanCard
                  plan="ENTERPRISE"
                  count={stats.planCounts?.enterprise || 0}
                />
              </div>
            </CardContent>
          </Card>

          <PlanDistributionChart
            planCounts={
              stats.planCounts || {
                free: 0,
                trial: 0,
                starter: 0,
                professional: 0,
                enterprise: 0,
              }
            }
          />
        </div>

        {/* 4. Sections Détaillées - Collapsibles */}
        {/* Section Hôtels - Collapsible */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => toggleSection("hotels")}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Détails Hôtels & Pipeline
              </CardTitle>
              {openSections.hotels ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {openSections.hotels ? "Masquer" : "Voir"} les statistiques
              détaillées des hôtels
            </p>
          </CardHeader>
          {openSections.hotels && (
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Hôtels"
                  value={stats.totalHotels || 0}
                  subtitle="Tous statuts confondus"
                  icon={Building2}
                  color="blue"
                />

                <StatCard
                  title="Essais Gratuits"
                  value={stats.trialHotels || 0}
                  subtitle="14 jours de test"
                  icon={Target}
                  color="green"
                />

                <StatCard
                  title="Suspendus"
                  value={stats.suspendedHotels || 0}
                  subtitle="Action requise"
                  icon={AlertTriangle}
                  color="orange"
                />

                <StatCard
                  title="Taux de Conversion"
                  value={
                    stats.trialHotels > 0 && stats.activeHotels > 0
                      ? `${Math.round(
                          (stats.activeHotels /
                            (stats.activeHotels + stats.trialHotels)) *
                            100
                        )}%`
                      : "0%"
                  }
                  subtitle="Trials → Hôtels payants"
                  icon={Target}
                  color="purple"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section Utilisateurs - Collapsible */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => toggleSection("users")}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Détails Utilisateurs
              </CardTitle>
              {openSections.users ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {openSections.users ? "Masquer" : "Voir"} les statistiques
              détaillées des utilisateurs
            </p>
          </CardHeader>
          {openSections.users && (
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Total Utilisateurs"
                  value={stats.totalUsers || 0}
                  subtitle="Sur tous les hôtels"
                  icon={Users}
                  color="blue"
                />

                <StatCard
                  title="Utilisateurs Actifs"
                  value={stats.activeUsers || 0}
                  subtitle="Actifs dans les 30 derniers jours"
                  icon={Activity}
                  color="green"
                />

                <StatCard
                  title="Moyenne par Hôtel"
                  value={
                    stats.totalHotels > 0
                      ? Math.round(
                          ((stats.totalUsers || 0) / stats.totalHotels) * 10
                        ) / 10
                      : 0
                  }
                  subtitle="Utilisateurs par hôtel"
                  icon={Users}
                  color="purple"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section Revenus - Collapsible */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => toggleSection("revenue")}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Détails Revenus & Projections
              </CardTitle>
              {openSections.revenue ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {openSections.revenue ? "Masquer" : "Voir"} les statistiques
              détaillées des revenus
            </p>
          </CardHeader>
          {openSections.revenue && (
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="ARR (Annuel)"
                  value={`${(stats.arr || 0).toLocaleString("fr-FR")} €`}
                  subtitle="Revenu annuel projeté"
                  icon={DollarSign}
                  color="blue"
                />

                <StatCard
                  title="MRR par Hôtel"
                  value={
                    stats.activeHotels > 0
                      ? `${Math.round((stats.mrr || 0) / stats.activeHotels)} €`
                      : "0 €"
                  }
                  subtitle="Revenu moyen par hôtel actif"
                  icon={DollarSign}
                  color="purple"
                />

                <StatCard
                  title="ARR Potentiel"
                  value={`${((stats.mrr || 0) * 12 * 1.5).toLocaleString(
                    "fr-FR",
                    {
                      maximumFractionDigits: 0,
                    }
                  )} €`}
                  subtitle="Avec 50% de croissance"
                  icon={TrendingUp}
                  color="orange"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section Performance - Collapsible */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => toggleSection("performance")}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Détails Performance & Croissance
              </CardTitle>
              {openSections.performance ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {openSections.performance ? "Masquer" : "Voir"} les statistiques
              détaillées de performance
            </p>
          </CardHeader>
          {openSections.performance && (
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <StatCard
                  title="Taux de Churn"
                  value={`${stats.churnRate || 0}%`}
                  subtitle="Hôtels perdus"
                  icon={TrendingDown}
                  color="red"
                />

                <StatCard
                  title="Croissance Hôtels"
                  value={stats.activeHotelsTrend || "0%"}
                  subtitle="Évolution sur 60 jours"
                  icon={TrendingUp}
                  color="blue"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* 5. Alertes & Actions Requises */}
        <Card>
          <CardHeader>
            <CardTitle>🚨 Alertes & Actions Requises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.endingTrials && stats.endingTrials.length > 0 && (
              <>
                {stats.endingTrials.map((hotel) => (
                  <AlertItem
                    key={hotel.id}
                    type="info"
                    title={hotel.name}
                    message={`Trial se termine dans ${hotel.daysLeft} jours`}
                    action="Contacter"
                    onAction={() => navigate(`/hotels/${hotel.id}`)}
                  />
                ))}
              </>
            )}

            {stats.lowActivityHotels && stats.lowActivityHotels.length > 0 && (
              <>
                {stats.lowActivityHotels.map((hotel) => (
                  <AlertItem
                    key={hotel.id}
                    type="warning"
                    title={hotel.name}
                    message={`Aucune activité depuis ${hotel.lastActivityDays} jours`}
                    action="Relancer"
                    onAction={() => navigate(`/hotels/${hotel.id}`)}
                  />
                ))}
              </>
            )}

            {(!stats.endingTrials || stats.endingTrials.length === 0) &&
              (!stats.lowActivityHotels ||
                stats.lowActivityHotels.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  Aucune alerte pour le moment
                </p>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
