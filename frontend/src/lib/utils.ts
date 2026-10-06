import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FacetSelection, FacetValue } from "@/lib/facets/facet.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYear(date: string | null | undefined): string | null {
  if (!date) {
    return null;
  }

  const year = new Date(date).getFullYear();

  return Number.isNaN(year) ? null : String(year);
}

export function setUrlSelectionParam<T extends FacetValue>(
  searchParams: URLSearchParams,
  name: string,
  selection: FacetSelection<T>
) {
  searchParams.delete(name);

  if (selection.mode !== "all") {
    selection.values.forEach((value) => searchParams.append(name, String(value)));
  }
}
