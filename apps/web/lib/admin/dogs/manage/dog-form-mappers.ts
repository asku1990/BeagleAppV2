import type {
  AdminBreederLookupOption,
  AdminDogListItem,
  AdminDogParentLookupOption,
  AdminOwnerLookupOption,
} from "@beagle/contracts";
import { normalizeDateForInput } from "@/lib/admin/core/date";
import type {
  AdminDogFormValues,
  AdminDogRecord,
} from "@/components/admin/dogs/types";

// Transforms admin dog query payloads and form-local values into UI-safe records/options.
export type AdminDogNamedEntityOption = {
  id: string;
  name: string;
};

export type AdminDogParentOption = {
  registrationNo: string;
  name: string;
};

export function createEmptyAdminDogFormValues(): AdminDogFormValues {
  return {
    name: "",
    sex: "UNKNOWN",
    birthDate: "",
    breederNameText: "",
    ownershipNames: [],
    ekNo: "",
    note: "",
    registrationNo: "",
    secondaryRegistrationNos: [],
    sirePreviewName: "",
    sirePreviewRegistrationNo: "",
    damPreviewName: "",
    damPreviewRegistrationNo: "",
    titles: [],
  };
}

export function mapAdminDogToFormValues(
  dog: AdminDogRecord,
): AdminDogFormValues {
  return {
    name: dog.name,
    sex: dog.sex,
    birthDate: dog.birthDate ?? "",
    breederNameText: dog.breederNameText ?? "",
    ownershipNames: dog.ownershipPreview,
    ekNo: dog.ekNo === null ? "" : String(dog.ekNo),
    note: dog.note ?? "",
    registrationNo: dog.registrationNo ?? "",
    secondaryRegistrationNos: dog.secondaryRegistrationNos,
    sirePreviewName: dog.sirePreview?.name ?? "",
    sirePreviewRegistrationNo: dog.sirePreview?.registrationNo ?? "",
    damPreviewName: dog.damPreview?.name ?? "",
    damPreviewRegistrationNo: dog.damPreview?.registrationNo ?? "",
    titles: dog.titles.map((title) => ({
      awardedOn: title.awardedOn ?? "",
      titleCode: title.titleCode,
      titleName: title.titleName ?? "",
    })),
  };
}

export function mapAdminDogFromQuery(item: AdminDogListItem): AdminDogRecord {
  return {
    id: item.id,
    registrationNo: item.registrationNo,
    secondaryRegistrationNos: item.secondaryRegistrationNos,
    name: item.name,
    sex: item.sex,
    birthDate: normalizeDateForInput(item.birthDate),
    breederNameText: item.breederName,
    ownershipPreview: item.ownerNames,
    sirePreview: item.sire
      ? {
          name: item.sire.name,
          registrationNo: item.sire.registrationNo ?? "",
        }
      : null,
    damPreview: item.dam
      ? {
          name: item.dam.name,
          registrationNo: item.dam.registrationNo ?? "",
        }
      : null,
    trialCount: item.trialCount,
    showCount: item.showCount,
    ekNo: item.ekNo,
    note: item.note,
    titles: (item.titles ?? []).map((title) => ({
      id: title.id,
      awardedOn: normalizeDateForInput(title.awardedOn),
      titleCode: title.titleCode,
      titleName: title.titleName,
      sortOrder: title.sortOrder,
    })),
  };
}

function mergeNamedOption(
  options: AdminDogNamedEntityOption[],
  name: string,
): AdminDogNamedEntityOption[] {
  const normalizedName = name.trim();
  if (!normalizedName) {
    return options;
  }

  if (options.some((option) => option.name === normalizedName)) {
    return options;
  }

  return [
    { id: `selected:${normalizedName}`, name: normalizedName },
    ...options,
  ];
}

function mergeParentOption(
  options: AdminDogParentOption[],
  option: AdminDogParentOption | null,
): AdminDogParentOption[] {
  if (!option) {
    return options;
  }

  const normalizedRegistrationNo = option.registrationNo.trim();
  const normalizedName = option.name.trim();
  if (!normalizedRegistrationNo || !normalizedName) {
    return options;
  }

  if (
    options.some((item) => item.registrationNo === normalizedRegistrationNo)
  ) {
    return options;
  }

  return [
    { registrationNo: normalizedRegistrationNo, name: normalizedName },
    ...options,
  ];
}

export function toAdminDogBreederOptions(
  options: AdminBreederLookupOption[] | undefined,
  selectedBreederName: string,
): AdminDogNamedEntityOption[] {
  const mapped = (options ?? []).map((option) => ({
    id: option.id,
    name: option.name,
  }));

  return mergeNamedOption(mapped, selectedBreederName);
}

export function toAdminDogOwnerOptions(
  options: AdminOwnerLookupOption[] | undefined,
): AdminDogNamedEntityOption[] {
  return (options ?? []).map((option) => ({
    id: option.id,
    name: option.name,
  }));
}

export function toAdminDogParentOptions(
  options: AdminDogParentLookupOption[] | undefined,
  input: {
    sirePreviewRegistrationNo: string;
    sirePreviewName: string;
    damPreviewRegistrationNo: string;
    damPreviewName: string;
  },
): AdminDogParentOption[] {
  const mapped = (options ?? [])
    .filter((option) => (option.registrationNo?.trim().length ?? 0) > 0)
    .map((option) => ({
      registrationNo: option.registrationNo ?? "",
      name: option.name,
    }));

  const withSire = mergeParentOption(mapped, {
    registrationNo: input.sirePreviewRegistrationNo,
    name: input.sirePreviewName,
  });

  return mergeParentOption(withSire, {
    registrationNo: input.damPreviewRegistrationNo,
    name: input.damPreviewName,
  });
}
