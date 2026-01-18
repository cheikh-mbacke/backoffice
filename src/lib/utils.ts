// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    ADMIN: "Admin (plateforme)",
    MANAGER: "Manager d'hôtel",
    STAFF: "Staff",
  };
  return roleLabels[role] || role;
}