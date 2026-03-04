const DEFAULT_LOOKUP_LIMIT = 20;
const MAX_LOOKUP_LIMIT = 100;

export function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim();
}

export function parseLookupLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_LOOKUP_LIMIT;
  }

  return Math.min(
    MAX_LOOKUP_LIMIT,
    Math.max(1, Math.floor(value ?? DEFAULT_LOOKUP_LIMIT)),
  );
}

export function uniqueNonEmptyNames(names: string[]): string[] {
  const seen = new Set<string>();
  for (const rawName of names) {
    const value = rawName.trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
  }

  return Array.from(seen);
}
