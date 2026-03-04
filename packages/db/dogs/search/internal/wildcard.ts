import type { SearchField } from "./types";

export function hasWildcard(value: string): boolean {
  return value.includes("%") || value.includes("_");
}

export function buildPattern(field: SearchField, rawValue: string): string {
  const value = rawValue.trim();
  if (!value) return "";
  if (hasWildcard(value)) return value;

  if (field === "name") {
    return `%${value}%`;
  }
  if (field === "reg") {
    return `${value}%`;
  }

  return value;
}

export function getWildcardProbe(value: string): string {
  const parts = value
    .split(/[%_]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .sort((left, right) => right.length - left.length);
  return parts[0] ?? "";
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchesLike(value: string, pattern: string): boolean {
  if (!pattern) return false;
  const regexPattern = pattern
    .split("")
    .map((char) => {
      if (char === "%") return ".*";
      if (char === "_") return ".";
      return escapeForRegex(char);
    })
    .join("");

  const regex = new RegExp(`^${regexPattern}$`, "i");
  return regex.test(value.trim());
}
