import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string | number): string {
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return format(d, "dd MMM yyyy, HH:mm", { locale: id });
  } catch {
    return "-";
  }
}

export function formatDateOnly(date: Date | string | number): string {
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return format(d, "dd MMMM yyyy", { locale: id });
  } catch {
    return "-";
  }
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(num);
}

export function generateTransactionNumber(type: "GR" | "GI"): string {
  const dateStr = format(new Date(), "yyyyMMdd");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TR-${type}-${dateStr}-${randomSuffix}`;
}

export function generateQrToken(materialCode: string): string {
  const cleanCode = materialCode.trim();
  return `QR-${cleanCode}`;
}
