export type RegistrationRow = {
  registrationNo: string;
  createdAt: Date;
};

function parseRegistrationOrder(registrationNo: string): {
  year: number;
  sequence: number;
} | null {
  const normalized = registrationNo.trim().toUpperCase();
  const segments = normalized.split("/");
  if (segments.length < 2) return null;

  const yearToken = segments[segments.length - 1] ?? "";
  if (!/^\d{2}(\d{2})?$/.test(yearToken)) return null;
  const rawYear = Number.parseInt(yearToken, 10);
  const year =
    yearToken.length === 2
      ? rawYear > new Date().getUTCFullYear() % 100
        ? 1900 + rawYear
        : 2000 + rawYear
      : rawYear;

  const beforeSlash = segments.slice(0, -1).join("/");
  const sequenceMatch = beforeSlash.match(/(\d+)(?!.*\d)/);
  if (!sequenceMatch) return null;
  const sequence = Number.parseInt(sequenceMatch[1], 10);

  if (!Number.isFinite(year) || !Number.isFinite(sequence)) return null;

  return {
    year,
    sequence,
  };
}

export function compareByRegistrationDesc(left: string, right: string): number {
  const leftOrder = parseRegistrationOrder(left);
  const rightOrder = parseRegistrationOrder(right);

  if (leftOrder && rightOrder) {
    if (rightOrder.year !== leftOrder.year) {
      return rightOrder.year - leftOrder.year;
    }
    if (rightOrder.sequence !== leftOrder.sequence) {
      return rightOrder.sequence - leftOrder.sequence;
    }
  }

  return right.localeCompare(left, "fi", { sensitivity: "base" });
}

function compareRegistrationRowsDesc(
  left: RegistrationRow,
  right: RegistrationRow,
): number {
  const createdComparison =
    right.createdAt.getTime() - left.createdAt.getTime();
  if (createdComparison !== 0) return createdComparison;
  return compareByRegistrationDesc(left.registrationNo, right.registrationNo);
}

export function sortRegistrationsDesc(
  rows: RegistrationRow[],
): RegistrationRow[] {
  return [...rows].sort(compareRegistrationRowsDesc);
}

export function getLatestRegistrationNo(
  rows: RegistrationRow[],
): string | null {
  return sortRegistrationsDesc(rows)[0]?.registrationNo ?? null;
}
