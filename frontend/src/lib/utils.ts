import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { FacetSelection } from "@/lib/facets/facet.types";

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

export function setUrlParams(
  currentSearchParams: URLSearchParams,
  params: { name: string; value: string | number; defaultValue?: string | number }[]
) {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  for (const param of params) {
    nextSearchParams.delete(param.name);

    if (param.value !== param.defaultValue) {
      nextSearchParams.set(param.name, String(param.value));
    }
  }

  return nextSearchParams;
}

export function setUrlListParam(
  searchParams: URLSearchParams,
  name: string,
  values: readonly (string | number)[]
) {
  searchParams.delete(name);

  values.forEach((value) => searchParams.append(name, String(value)));
}

export function setUrlSelectionParam(
  searchParams: URLSearchParams,
  name: string,
  selection: FacetSelection
) {
  if (selection.mode === "all") {
    setUrlListParam(searchParams, name, []);
    return;
  }

  setUrlListParam(searchParams, name, selection.ids);

  if (selection.ids.length === 0) {
    searchParams.append(name, "null");
  }
}
