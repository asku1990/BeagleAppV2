import { type DogSex } from "@prisma/client";
import { getFirstInsertedRegistrationNo } from "../../core/registration";
import type { RegistrationRow } from "../../core/registration";

export type VirtualPairingSearchFieldDb = "ek" | "reg" | "name";

export const VIRTUAL_PAIRING_MAX_PAGE_SIZE = 50;
export const VIRTUAL_PAIRING_BROAD_CANDIDATE_LIMIT = 1000;

export type VirtualPairingSearchRequestDb = {
  field: VirtualPairingSearchFieldDb;
  query: string;
  page?: number;
  pageSize?: number;
};

export type VirtualPairingSearchDogRowDb = {
  id: string;
  ekNo: number | null;
  registrationNo: string;
  name: string;
  sex: "U" | "N" | "-";
};

export type VirtualPairingSearchResponseDb = {
  field: VirtualPairingSearchFieldDb;
  query: string;
  total: number;
  totalPages: number;
  page: number;
  isLimited: boolean;
  candidateLimit: number | null;
  items: VirtualPairingSearchDogRowDb[];
};

export type RawVirtualPairingDogRow = {
  id: string;
  ekNo: number | null;
  name: string;
  sex: DogSex;
  registrations: RegistrationRow[];
};

export function normalizeQuery(value: string): string {
  return value.trim();
}

export function hasWildcard(value: string): boolean {
  return value.includes("%") || value.includes("_");
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchesLike(value: string, pattern: string): boolean {
  const regexPattern = pattern
    .split("")
    .map((char) => {
      if (char === "%") return ".*";
      if (char === "_") return ".";
      return escapeRegex(char);
    })
    .join("");
  return new RegExp(`^${regexPattern}$`, "i").test(value.trim());
}

export function getWildcardProbe(value: string): string {
  const parts = value
    .split(/[%_]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .sort((left, right) => right.length - left.length);
  return parts[0] ?? "";
}

export function toSexCode(value: DogSex): "U" | "N" | "-" {
  if (value === "MALE") return "U";
  if (value === "FEMALE") return "N";
  return "-";
}

export function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

export function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(
    VIRTUAL_PAIRING_MAX_PAGE_SIZE,
    Math.max(1, Math.floor(value ?? 10)),
  );
}

export function resolvePrimaryRegistrationNo(rows: RegistrationRow[]): string {
  return getFirstInsertedRegistrationNo(rows) ?? "-";
}
