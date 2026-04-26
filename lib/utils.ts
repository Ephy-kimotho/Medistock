import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LIMIT = 9;
export const NAME_PATTERN = /^[a-zA-Z\s']+$/;
export const PHONE_PATTERN = /^\+?(?=(?:\D*\d){7,15}\D*$)[\d\s\-]+$/;


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

export function downloadPdf(base64Data: string, filename: string) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function preventNumbers(e: React.KeyboardEvent<HTMLInputElement>) {
  // Allow: backspace, delete, tab, escape, enter, arrows
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(e.key)) {
    return;
  }

  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if (e.ctrlKey || e.metaKey) {
    return;
  }

  // Block numbers (0-9)
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

export function preventLetters(e: React.KeyboardEvent<HTMLInputElement>) {

  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(e.key)) {
    return;
  }


  if (e.ctrlKey || e.metaKey) {
    return;
  }

  const allowedChars = /^[0-9+\s\-]$/;

  if (!allowedChars.test(e.key)) {
    e.preventDefault();
  }
}