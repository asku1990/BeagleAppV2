type DiseaseDefinitionRow = {
  koodi: string;
  sairausTeksti: string;
  _count: {
    koirat: number;
  };
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 100;

export function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_PAGE;
  }

  return Math.max(DEFAULT_PAGE, Math.floor(value ?? DEFAULT_PAGE));
}

export function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(value ?? DEFAULT_PAGE_SIZE)),
  );
}

function normalizeDiseaseCode(
  value: string | null | undefined,
): string | null | undefined {
  if (value == null) {
    return value;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function isEpiDisease(definition: DiseaseDefinitionRow): boolean {
  const text = definition.sairausTeksti.trim().toLowerCase();
  const code = definition.koodi.trim().toLowerCase();

  return text === "epilepsia" || code === "epi";
}

export function resolveSelectedDiseaseCode(
  inputDiseaseCode: string | null | undefined,
  diseaseDefinitions: DiseaseDefinitionRow[],
): string | null {
  if (inputDiseaseCode === null) {
    return null;
  }

  const normalized = normalizeDiseaseCode(inputDiseaseCode);
  if (normalized) {
    const match = diseaseDefinitions.find(
      (definition) => definition.koodi === normalized,
    );
    if (match) {
      return match.koodi;
    }
  }

  return diseaseDefinitions.find(isEpiDisease)?.koodi ?? null;
}

export type { DiseaseDefinitionRow };
