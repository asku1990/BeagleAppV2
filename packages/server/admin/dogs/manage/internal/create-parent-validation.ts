import type { CreateAdminDogResponse } from "@beagle/contracts";
import type { ServiceResult } from "@server/core/result";
import { normalizeOptionalText } from "../normalization";
import {
  invalidDamRegistrationResponse,
  invalidDamSexResponse,
  invalidParentCombinationResponse,
  invalidSireRegistrationResponse,
  invalidSireSexResponse,
} from "./manage-responses";
import {
  resolveParentByRegistration,
  type ParentRef,
} from "./parent-resolution";

type CreateParentValidationFailure = {
  ok: false;
  response: ServiceResult<CreateAdminDogResponse>;
};

type CreateParentValidationSuccess = {
  ok: true;
  data: {
    sire: ParentRef | null;
    dam: ParentRef | null;
  };
};

export type CreateParentValidationResult =
  | CreateParentValidationSuccess
  | CreateParentValidationFailure;

export async function resolveAndValidateCreateParents(input: {
  sireRegistrationNo?: string | null;
  damRegistrationNo?: string | null;
}): Promise<CreateParentValidationResult> {
  const sireRegistrationNo = normalizeOptionalText(
    input.sireRegistrationNo ?? undefined,
  );
  const damRegistrationNo = normalizeOptionalText(
    input.damRegistrationNo ?? undefined,
  );

  const sire = await resolveParentByRegistration(sireRegistrationNo);
  if (sireRegistrationNo && !sire) {
    return {
      ok: false,
      response: invalidSireRegistrationResponse(),
    };
  }

  const dam = await resolveParentByRegistration(damRegistrationNo);
  if (damRegistrationNo && !dam) {
    return {
      ok: false,
      response: invalidDamRegistrationResponse(),
    };
  }

  if (sire && dam && sire.id === dam.id) {
    return {
      ok: false,
      response: invalidParentCombinationResponse(),
    };
  }

  if (sire && sire.sex !== "MALE") {
    return {
      ok: false,
      response: invalidSireSexResponse(),
    };
  }

  if (dam && dam.sex !== "FEMALE") {
    return {
      ok: false,
      response: invalidDamSexResponse(),
    };
  }

  return {
    ok: true,
    data: {
      sire,
      dam,
    },
  };
}
