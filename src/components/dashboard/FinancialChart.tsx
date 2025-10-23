// src/components/dashboard/FinancialChart.tsx
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
import { DollarSign, Loader2 } from "lucide-react";
import { useFinancialChartData } from "@/hooks/useSaaS";

export function FinancialChart() {
  const [period, setPeriod] = useState<"6m" | "12m">("6m");
  const { data, isLoading, error } = useFinancialChartData(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Évolution MRR & Clients
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
            <DollarSign className="h-5 w-5" />
            Évolution MRR & Clients
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
  const chartData = data?.labels.map((label, index) => ({
    month: label,
    mrr: data.datasets[0]?.data[index] || 0,
    clients: data.datasets[1]?.data[index] || 0,
  })) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Évolution MRR & Clients
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === "6m" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("6m")}
            >
              6 mois
            </Button>
            <Button
              variant={period === "12m" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("12m")}
            >
              12 mois
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Suivi mensuel du revenu récurrent et du nombre de clients actifs
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              label={{
                value: "MRR (€)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{
                value: "Clients",
                angle: 90,
                position: "insideRight",
                style: { fontSize: 12 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="mrr"
              stroke="#10b981"
              strokeWidth={2}
              name="MRR (€)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="clients"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Clients Actifs"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

