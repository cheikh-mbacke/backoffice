// src/components/dashboard/PlanCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPlan } from "@/types";

interface PlanCardProps {
  plan: SubscriptionPlan;
  count: number;
}

const planConfig = {
  FREE: {
    label: "FREE",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    description: "Gratuit",
  },
  TRIAL: {
    label: "TRIAL",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    description: "Essai gratuit",
  },
  STARTER: {
    label: "STARTER",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    description: "Démarrage",
  },
  PROFESSIONAL: {
    label: "PROFESSIONAL",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    description: "Professionnel",
  },
  ENTERPRISE: {
    label: "ENTERPRISE",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    description: "Entreprise",
  },
};

export function PlanCard({ plan, count }: PlanCardProps) {
  const config = planConfig[plan];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-2">
          <Badge className={config.color}>{config.label}</Badge>
          <div className="text-3xl font-bold">{count}</div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
