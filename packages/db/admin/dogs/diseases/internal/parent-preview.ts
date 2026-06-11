import type { AdminDogDiseaseBrowseParentPreviewDb } from "../types";

type ParentDogPreviewRow = {
  name: string;
  registrations: Array<{ registrationNo: string }>;
};

export function normalizeRegistrationNo(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toParentPreview(
  parent: ParentDogPreviewRow | null,
  fallbackRegistrationNo: string | null,
): AdminDogDiseaseBrowseParentPreviewDb {
  if (!parent) {
    return {
      registrationNo: fallbackRegistrationNo,
      name: null,
    };
  }

  return {
    registrationNo:
      parent.registrations[0]?.registrationNo ?? fallbackRegistrationNo,
    name: parent.name.trim().length > 0 ? parent.name : null,
  };
}

function buildParentLookup(
  parentDogs: ParentDogPreviewRow[],
): Map<string, AdminDogDiseaseBrowseParentPreviewDb> {
  const lookup = new Map<string, AdminDogDiseaseBrowseParentPreviewDb>();

  for (const dog of parentDogs) {
    const preview = {
      registrationNo: dog.registrations[0]?.registrationNo ?? null,
      name: dog.name.trim().length > 0 ? dog.name : null,
    };

    for (const registration of dog.registrations) {
      const key = normalizeRegistrationNo(registration.registrationNo);
      if (!key) {
        continue;
      }

      lookup.set(key, preview);
    }
  }

  return lookup;
}

function resolveParentFromLookup(
  registrationNo: string | null,
  lookup: Map<string, AdminDogDiseaseBrowseParentPreviewDb>,
): AdminDogDiseaseBrowseParentPreviewDb {
  const normalized = normalizeRegistrationNo(registrationNo);
  if (!normalized) {
    return {
      registrationNo: null,
      name: null,
    };
  }

  return (
    lookup.get(normalized) ?? {
      registrationNo: normalized,
      name: null,
    }
  );
}

export function mapParentPreviews(
  parentDogs: ParentDogPreviewRow[],
): Map<string, AdminDogDiseaseBrowseParentPreviewDb> {
  return buildParentLookup(parentDogs);
}

export function getParentPreview(
  registrationNo: string | null,
  lookup: Map<string, AdminDogDiseaseBrowseParentPreviewDb>,
): AdminDogDiseaseBrowseParentPreviewDb {
  return resolveParentFromLookup(registrationNo, lookup);
}

export function createParentPreview(
  parent: ParentDogPreviewRow | null,
  fallbackRegistrationNo: string | null,
): AdminDogDiseaseBrowseParentPreviewDb {
  return toParentPreview(parent, fallbackRegistrationNo);
}

export type { ParentDogPreviewRow };
