import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LIMIT = 9;

export function formatRole(role: string) {
  const roleMap: Record<string, string> = {
    admin: "Admin",
    user: "Pharmacist",
    inventory_manager: "Manager",
    auditor: "Auditor",
    hr: "Human Resource"
  };
  return roleMap[role.toLowerCase()] || role;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}
