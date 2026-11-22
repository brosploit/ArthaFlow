import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "INR",
  options?: { compact?: boolean; hideDecimals?: boolean }
): string {
  const symbolMap: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  const symbol = symbolMap[currency] || currency;

  if (options?.compact) {
    if (currency === "INR") {
      const abs = Math.abs(amount);
      if (abs >= 10000000) {
        return `${amount < 0 ? "-" : ""}${symbol}${(abs / 10000000).toFixed(2)} Cr`;
      }
      if (abs >= 100000) {
        return `${amount < 0 ? "-" : ""}${symbol}${(abs / 100000).toFixed(2)} L`;
      }
      if (abs >= 1000) {
        return `${amount < 0 ? "-" : ""}${symbol}${(abs / 1000).toFixed(1)}k`;
      }
    } else {
      const abs = Math.abs(amount);
      if (abs >= 1000000) {
        return `${amount < 0 ? "-" : ""}${symbol}${(abs / 1000000).toFixed(2)}M`;
      }
      if (abs >= 1000) {
        return `${amount < 0 ? "-" : ""}${symbol}${(abs / 1000).toFixed(1)}k`;
      }
    }
  }

  const formattedNum = new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    minimumFractionDigits: options?.hideDecimals ? 0 : 2,
    maximumFractionDigits: options?.hideDecimals ? 0 : 2,
  }).format(Math.abs(amount));

  return `${amount < 0 ? "-" : ""}${symbol}${formattedNum}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDays(days: number): string {
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}
