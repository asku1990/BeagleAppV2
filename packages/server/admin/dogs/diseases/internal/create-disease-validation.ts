import type { CreateAdminDogDiseaseRequest } from "@beagle/contracts";
import {
  normalizeOptionalText,
  normalizeRegistrationNo,
} from "@server/admin/dogs/manage/normalization";

const DISEASE_CODE_MAX_LENGTH = 40;
const REGISTRATION_NO_MAX_LENGTH = 40;
const LITTER_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 1000;
const SOURCE_MAX_LENGTH = 255;

export type CreateDogDiseaseValidationResult =
  | {
      ok: true;
      data: {
        diseaseCode: string;
        registrationNo: string;
        sireRegistrationNo: string | null;
        damRegistrationNo: string | null;
        litter: string | null;
        description: string | null;
        source: string | null;
      };
    }
  | {
      ok: false;
      code: string;
      error: string;
    };

function validateLength(
  value: string | null,
  maxLength: number,
  code: string,
  error: string,
): CreateDogDiseaseValidationResult | null {
  if (value && value.length > maxLength) {
    return { ok: false, code, error };
  }

  return null;
}

export function validateCreateDogDiseaseInput(
  input: CreateAdminDogDiseaseRequest,
): CreateDogDiseaseValidationResult {
  const diseaseCode = normalizeOptionalText(input.diseaseCode);
  if (!diseaseCode) {
    return {
      ok: false,
      code: "INVALID_DISEASE_CODE",
      error: "Disease is required.",
    };
  }

  if (diseaseCode.length > DISEASE_CODE_MAX_LENGTH) {
    return {
      ok: false,
      code: "INVALID_DISEASE_CODE",
      error: "Disease code is too long.",
    };
  }

  const registrationNo = normalizeRegistrationNo(input.registrationNo);
  if (!registrationNo) {
    return {
      ok: false,
      code: "INVALID_REGISTRATION_NO",
      error: "Registration number is required.",
    };
  }

  if (registrationNo.length > REGISTRATION_NO_MAX_LENGTH) {
    return {
      ok: false,
      code: "INVALID_REGISTRATION_NO",
      error: "Registration number is too long.",
    };
  }

  const sireRegistrationNo = normalizeRegistrationNo(
    input.sireRegistrationNo ?? "",
  );
  const damRegistrationNo = normalizeRegistrationNo(
    input.damRegistrationNo ?? "",
  );
  const litter = normalizeOptionalText(input.litter ?? undefined);
  const description = normalizeOptionalText(input.description ?? undefined);
  const source = normalizeOptionalText(input.source ?? undefined);

  const lengthError =
    validateLength(
      litter,
      LITTER_MAX_LENGTH,
      "INVALID_LITTER",
      "Litter is too long.",
    ) ??
    validateLength(
      description,
      DESCRIPTION_MAX_LENGTH,
      "INVALID_DESCRIPTION",
      "Description is too long.",
    ) ??
    validateLength(
      source,
      SOURCE_MAX_LENGTH,
      "INVALID_SOURCE",
      "Source is too long.",
    );
  if (lengthError) {
    return lengthError;
  }

  if (input.evidenceKind !== "DOG" && input.evidenceKind !== "LITTER") {
    return {
      ok: false,
      code: "INVALID_EVIDENCE_KIND",
      error: "Disease evidence kind is invalid.",
    };
  }

  if (
    input.evidenceKind === "LITTER" &&
    (!sireRegistrationNo || !damRegistrationNo)
  ) {
    return {
      ok: false,
      code: "MISSING_LITTER_PARENTS",
      error:
        "Litter disease evidence requires sire and dam registration numbers.",
    };
  }

  return {
    ok: true,
    data: {
      diseaseCode,
      registrationNo,
      sireRegistrationNo,
      damRegistrationNo,
      litter,
      description,
      source,
    },
  };
}
