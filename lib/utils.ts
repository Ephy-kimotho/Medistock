import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    admin: "Admin",
    user: "User",
    inventory_manager: "Inventory Manager",
    auditor: "Auditor",
  };
  return roleMap[role.toLowerCase()] || role;
}