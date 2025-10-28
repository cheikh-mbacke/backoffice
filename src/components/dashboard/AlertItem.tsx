// src/components/dashboard/AlertItem.tsx
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertItemProps {
  type: "warning" | "info" | "error";
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-600 dark:text-orange-400",
    textColor: "text-orange-900 dark:text-orange-100",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-900 dark:text-blue-100",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    textColor: "text-red-900 dark:text-red-100",
  },
};

export function AlertItem({
  type,
  title,
  message,
  action,
  onAction,
}: AlertItemProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-3",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-5 w-5", config.iconColor)} />
        <div>
          <p className={cn("text-sm font-medium", config.textColor)}>{title}</p>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      </div>
      {action && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}
