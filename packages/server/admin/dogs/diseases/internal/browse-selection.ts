import type { AdminDogDiseaseDefinitionOptionDb } from "@beagle/db";
import type {
  AdminDogDiseaseBrowseRequest,
  AdminDogDiseaseGroup,
} from "@beagle/contracts";

const DEFAULT_DISEASE_GROUP: AdminDogDiseaseGroup = "EPILEPSIA";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 100;

export function parseDiseaseBrowsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_PAGE;
  }

  return Math.max(DEFAULT_PAGE, Math.floor(value ?? DEFAULT_PAGE));
}

export function parseDiseaseBrowsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(value ?? DEFAULT_PAGE_SIZE)),
  );
}

export function normalizeDiseaseSearchQuery(
  value: string | null | undefined,
): string {
  return value?.trim() ?? "";
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

function isEpiDisease(definition: AdminDogDiseaseDefinitionOptionDb): boolean {
  const text = definition.diseaseText.trim().toLowerCase();
  const code = definition.diseaseCode.trim().toLowerCase();

  return text === "epilepsia" || code === "epi";
}

export function resolveSelectedDiseaseCode(
  inputDiseaseCode: string | null | undefined,
  diseaseDefinitions: AdminDogDiseaseDefinitionOptionDb[],
): string | null {
  if (inputDiseaseCode === null) {
    return null;
  }

  const normalized = normalizeDiseaseCode(inputDiseaseCode);
  if (normalized) {
    const match = diseaseDefinitions.find(
      (definition) => definition.diseaseCode === normalized,
    );
    if (match) {
      return match.diseaseCode;
    }
  }

  return diseaseDefinitions.find(isEpiDisease)?.diseaseCode ?? null;
}

export function resolveSelectedDiseaseGroup(
  input: AdminDogDiseaseBrowseRequest,
  selectedDiseaseCode: string | null,
  diseaseDefinitions: AdminDogDiseaseDefinitionOptionDb[],
): AdminDogDiseaseGroup | null {
  if (input.diseaseCode !== undefined) {
    if (selectedDiseaseCode === null) {
      return null;
    }

    return (
      (diseaseDefinitions.find(
        (definition) => definition.diseaseCode === selectedDiseaseCode,
      )?.diseaseGroup as AdminDogDiseaseGroup | undefined) ?? null
    );
  }

  if (input.diseaseGroup === null) {
    return null;
  }

  return input.diseaseGroup ?? DEFAULT_DISEASE_GROUP;
}
