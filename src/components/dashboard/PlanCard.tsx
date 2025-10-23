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
    color: "bg-gray-100 text-gray-800",
    description: "Gratuit",
  },
  STARTER: {
    label: "STARTER",
    color: "bg-blue-100 text-blue-800",
    description: "Démarrage",
  },
  PROFESSIONAL: {
    label: "PROFESSIONAL",
    color: "bg-purple-100 text-purple-800",
    description: "Professionnel",
  },
  ENTERPRISE: {
    label: "ENTERPRISE",
    color: "bg-amber-100 text-amber-800",
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
