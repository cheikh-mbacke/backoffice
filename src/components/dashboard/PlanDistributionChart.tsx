// src/components/dashboard/PlanDistributionChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface PlanDistributionChartProps {
  planCounts: {
    free: number;
    starter: number;
    professional: number;
    enterprise: number;
  };
}

const COLORS = {
  free: "#94a3b8",
  starter: "#3b82f6",
  professional: "#8b5cf6",
  enterprise: "#f59e0b",
};

const PLAN_LABELS = {
  free: "FREE",
  starter: "STARTER",
  professional: "PROFESSIONAL",
  enterprise: "ENTERPRISE",
};

export function PlanDistributionChart({
  planCounts,
}: PlanDistributionChartProps) {
  // Transformer les données pour Recharts
  const chartData = Object.entries(planCounts)
    .filter(([, value]) => value > 0) // Ne montrer que les plans avec des clients
    .map(([key, value]) => ({
      name: PLAN_LABELS[key as keyof typeof PLAN_LABELS],
      value,
      color: COLORS[key as keyof typeof COLORS],
    }));

  // Calculer le total
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Répartition par Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-sm">
            Aucune donnée disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Répartition par Plan
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Distribution des {total} clients par type d'abonnement
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} client(s)`, "Nombre"]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Légende détaillée */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <span className="text-sm font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

