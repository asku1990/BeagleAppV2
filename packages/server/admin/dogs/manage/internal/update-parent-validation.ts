import type { UpdateAdminDogResponse } from "@beagle/contracts";
import type { ServiceResult } from "@server/core/result";
import {
  invalidDamRegistrationResponse,
  invalidDamSexResponse,
  invalidParentCombinationResponse,
  invalidSelfParentDamResponse,
  invalidSelfParentResponse,
  invalidSireRegistrationResponse,
  invalidSireSexResponse,
} from "./manage-responses";
import {
  resolveParentByRegistration,
  type ParentRef,
} from "./parent-resolution";

type UpdateParentValidationFailure = {
  ok: false;
  response: ServiceResult<UpdateAdminDogResponse>;
};

type UpdateParentValidationSuccess<T> = {
  ok: true;
  data: T;
};

type ExistingDogParentState = {
  sire: ParentRef | null;
  dam: ParentRef | null;
};

export type UpdateParentResolutionResult =
  | UpdateParentValidationSuccess<{
      sire: ParentRef | null | undefined;
      dam: ParentRef | null | undefined;
    }>
  | UpdateParentValidationFailure;

export type UpdateParentGuardResult =
  | UpdateParentValidationSuccess<{
      effectiveSire: ParentRef | null;
      effectiveDam: ParentRef | null;
    }>
  | UpdateParentValidationFailure;

export async function resolveUpdateParents(
  sireRegistrationNo: string | null | undefined,
  damRegistrationNo: string | null | undefined,
): Promise<UpdateParentResolutionResult> {
  let sire: ParentRef | null | undefined;
  if (sireRegistrationNo !== undefined) {
    sire = await resolveParentByRegistration(sireRegistrationNo);
  }

  if (sireRegistrationNo && !sire) {
    return {
      ok: false,
      response: invalidSireRegistrationResponse(),
    };
  }

  let dam: ParentRef | null | undefined;
  if (damRegistrationNo !== undefined) {
    dam = await resolveParentByRegistration(damRegistrationNo);
  }

  if (damRegistrationNo && !dam) {
    return {
      ok: false,
      response: invalidDamRegistrationResponse(),
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

export function validateUpdateParentGuards(
  dogId: string,
  existingDog: ExistingDogParentState,
  sire: ParentRef | null | undefined,
  dam: ParentRef | null | undefined,
): UpdateParentGuardResult {
  const effectiveSire: ParentRef | null =
    sire === undefined ? existingDog.sire : sire;
  const effectiveDam: ParentRef | null =
    dam === undefined ? existingDog.dam : dam;

  if (effectiveSire && effectiveDam && effectiveSire.id === effectiveDam.id) {
    return {
      ok: false,
      response: invalidParentCombinationResponse(),
    };
  }

  if (effectiveSire && effectiveSire.id === dogId) {
    return {
      ok: false,
      response: invalidSelfParentResponse(),
    };
  }

  if (effectiveDam && effectiveDam.id === dogId) {
    return {
      ok: false,
      response: invalidSelfParentDamResponse(),
    };
  }

  if (effectiveSire && effectiveSire.sex !== "MALE") {
    return {
      ok: false,
      response: invalidSireSexResponse(),
    };
  }

  if (effectiveDam && effectiveDam.sex !== "FEMALE") {
    return {
      ok: false,
      response: invalidDamSexResponse(),
    };
  }

  return {
    ok: true,
    data: {
      effectiveSire,
      effectiveDam,
    },
  };
}
