import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYear(date: string | null): string | null {
  if (!date) {
    return null;
  }

  const year = new Date(date).getFullYear();

  return Number.isNaN(year) ? null : String(year);
}
