import { loadDogPedigreeAncestryForParentsDb } from "@beagle/db";
import type {
  CalculateAdminDogInbreedingRequest,
  CalculateAdminDogInbreedingResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { calculateInbreedingCoefficientForParentsPct } from "@server/dogs/core";
import { normalizeOptionalText } from "./normalization";
import { resolveParentByRegistration } from "./internal/parent-resolution";
import {
  invalidDamSexResponse,
  invalidSireSexResponse,
} from "./internal/manage-responses";

type CalculateResult = ServiceResult<CalculateAdminDogInbreedingResponse>;

function invalidSireRegistrationResponse(): CalculateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Sire registration number was not found.",
      code: "INVALID_SIRE_REGISTRATION",
    },
  };
}

function invalidDamRegistrationResponse(): CalculateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Dam registration number was not found.",
      code: "INVALID_DAM_REGISTRATION",
    },
  };
}

function invalidParentCombinationResponse(): CalculateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Sire and dam must be different dogs.",
      code: "INVALID_PARENT_COMBINATION",
    },
  };
}

function internalErrorResponse(): CalculateResult {
  return {
    status: 500,
    body: {
      ok: false,
      error: "Failed to calculate inbreeding coefficient.",
      code: "INTERNAL_ERROR",
    },
  };
}

export async function calculateAdminDogInbreeding(
  input: CalculateAdminDogInbreedingRequest,
  currentUser: CurrentUserDto | null,
): Promise<CalculateResult> {
  const startedAt = Date.now();
  const sireRegistrationNo = normalizeOptionalText(input.sireRegistrationNo);
  const damRegistrationNo = normalizeOptionalText(input.damRegistrationNo);
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.calculateAdminDogInbreeding",
    ...(currentUser?.id ? { actorUserId: currentUser.id } : {}),
  });

  log.info(
    {
      event: "start",
      hasSireRegistrationNo: Boolean(sireRegistrationNo),
      hasDamRegistrationNo: Boolean(damRegistrationNo),
    },
    "admin dog inbreeding calculation started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog inbreeding calculation rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  if (!sireRegistrationNo) {
    return invalidSireRegistrationResponse();
  }

  if (!damRegistrationNo) {
    return invalidDamRegistrationResponse();
  }

  try {
    const sire = await resolveParentByRegistration(sireRegistrationNo);
    if (!sire) {
      return invalidSireRegistrationResponse();
    }

    const dam = await resolveParentByRegistration(damRegistrationNo);
    if (!dam) {
      return invalidDamRegistrationResponse();
    }

    if (sire.id === dam.id) {
      return invalidParentCombinationResponse();
    }

    if (sire.sex !== "MALE") {
      return invalidSireSexResponse<CalculateAdminDogInbreedingResponse>();
    }

    if (dam.sex !== "FEMALE") {
      return invalidDamSexResponse<CalculateAdminDogInbreedingResponse>();
    }

    const ancestry = await loadDogPedigreeAncestryForParentsDb(
      sire.id,
      dam.id,
      9,
    );
    const inbreedingCoefficientPct =
      calculateInbreedingCoefficientForParentsPct(sire.id, dam.id, ancestry, 9);

    log.info(
      {
        event: "success",
        sireId: sire.id,
        damId: dam.id,
        durationMs: Date.now() - startedAt,
      },
      "admin dog inbreeding calculation succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: { inbreedingCoefficientPct },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog inbreeding calculation failed",
    );

    return internalErrorResponse();
  }
}
