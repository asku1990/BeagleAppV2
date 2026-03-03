export type BeaglePrimarySearchField = "ek" | "reg" | "name";

export type BeaglePrimarySearchMode =
  | BeaglePrimarySearchField
  | "none"
  | "combined"
  | "invalid";

export type BeaglePrimaryInput = {
  ek: string;
  reg: string;
  name: string;
};

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function hasLegacyWildcard(value: string): boolean {
  return value.includes("%") || value.includes("_");
}

export function resolvePrimarySearchMode(
  input: BeaglePrimaryInput,
): BeaglePrimarySearchMode {
  const filledFields = [
    input.ek.trim().length > 0 ? "ek" : null,
    input.reg.trim().length > 0 ? "reg" : null,
    input.name.trim().length > 0 ? "name" : null,
  ].filter((field): field is BeaglePrimarySearchField => field !== null);

  if (filledFields.length === 0) {
    return "none";
  }

  if (filledFields.length > 1) {
    return "combined";
  }

  return filledFields[0];
}

export function buildLegacyPattern(
  field: BeaglePrimarySearchField,
  rawValue: string,
): string {
  const value = rawValue.trim();
  if (!value) {
    return "";
  }

  if (hasLegacyWildcard(value)) {
    return value;
  }

  if (field === "name") {
    return `%${value}%`;
  }

  if (field === "reg") {
    return `${value}%`;
  }

  return value;
}

export function matchesLegacyLike(value: string, pattern: string): boolean {
  const normalizedValue = value.trim();
  const normalizedPattern = pattern.trim();

  if (!normalizedPattern) {
    return false;
  }

  const regexPattern = normalizedPattern
    .split("")
    .map((char) => {
      if (char === "%") {
        return ".*";
      }
      if (char === "_") {
        return ".";
      }
      return escapeForRegex(char);
    })
    .join("");

  const regex = new RegExp(`^${regexPattern}$`, "i");
  return regex.test(normalizedValue);
}
