// src/components/dashboard/ActivityChart.tsx
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Loader2 } from "lucide-react";
import { useActivityChartData } from "@/hooks/useSaaS";

export function ActivityChart() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { data, isLoading, error } = useActivityChartData(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activité Quotidienne
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activité Quotidienne
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-red-500 text-sm">
            Erreur lors du chargement des données
          </p>
        </CardContent>
      </Card>
    );
  }

  // Transformer les données pour Recharts
  const chartData =
    data?.labels.map((label, index) => ({
      date: new Date(label).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      nouveauxUtilisateurs: data.datasets[0]?.data[index] || 0,
      consignes: data.datasets[1]?.data[index] || 0,
      utilisateursActifs: data.datasets[2]?.data[index] || 0,
    })) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="h-5 w-5 flex-shrink-0" />
            <span>Activité Quotidienne</span>
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={period === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("7d")}
              className="text-xs sm:text-sm"
            >
              7 jours
            </Button>
            <Button
              variant={period === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("30d")}
              className="text-xs sm:text-sm"
            >
              30 jours
            </Button>
            <Button
              variant={period === "90d" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("90d")}
              className="text-xs sm:text-sm"
            >
              90 jours
            </Button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Suivi de l'activité des utilisateurs et de la création de consignes
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="consignes"
              stroke="#10b981"
              strokeWidth={3}
              name="Consignes créées"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="utilisateursActifs"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Utilisateurs actifs"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="nouveauxUtilisateurs"
              stroke="#f59e0b"
              strokeWidth={3}
              name="Nouveaux utilisateurs"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
