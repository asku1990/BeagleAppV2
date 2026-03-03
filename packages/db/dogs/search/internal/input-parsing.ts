import type { BeagleSearchSortDb } from "../repository";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  MAX_PAGE_SIZE,
} from "./constants";

export function normalizeText(value: string | undefined): string {
  return (value ?? "").trim();
}

export function normalizeSex(value: unknown): "male" | "female" | undefined {
  if (value === "male" || value === "female") {
    return value;
  }
  return undefined;
}

export function normalizeBirthYear(value: unknown): number | undefined {
  if (!Number.isFinite(value)) {
    return undefined;
  }

  const year = Math.floor(value as number);
  if (year < 1000 || year > 9999) {
    return undefined;
  }

  return year;
}

export function parseSort(input: string | undefined): BeagleSearchSortDb {
  if (
    input === "name-asc" ||
    input === "birth-desc" ||
    input === "reg-desc" ||
    input === "created-desc" ||
    input === "ek-asc"
  ) {
    return input;
  }
  return DEFAULT_SORT;
}

export function parsePage(input: number | undefined): number {
  if (!Number.isFinite(input)) return DEFAULT_PAGE;
  return Math.max(DEFAULT_PAGE, Math.floor(input ?? DEFAULT_PAGE));
}

export function parsePageSize(input: number | undefined): number {
  if (!Number.isFinite(input)) return DEFAULT_PAGE_SIZE;
  const parsed = Math.floor(input ?? DEFAULT_PAGE_SIZE);
  return Math.min(MAX_PAGE_SIZE, Math.max(1, parsed));
}
