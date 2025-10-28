// src/components/dashboard/StatCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorClasses = {
  blue: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  green: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  purple:
    "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
  orange:
    "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
  red: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
};

const trendClasses = {
  positive: "text-green-600 dark:text-green-400",
  negative: "text-red-600 dark:text-red-400",
  neutral: "text-gray-600 dark:text-gray-400",
};

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = "blue",
}: StatCardProps) {
  const getTrendClass = () => {
    if (!trend) return "";
    if (trend.startsWith("+")) return trendClasses.positive;
    if (trend.startsWith("-")) return trendClasses.negative;
    return trendClasses.neutral;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("rounded-full p-2", colorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className={cn("text-xs font-medium mt-1", getTrendClass())}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
