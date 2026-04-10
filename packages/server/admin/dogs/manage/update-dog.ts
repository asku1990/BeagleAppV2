import {
  findDogByIdDb,
  runAdminDogWriteTransactionDb,
  updateAdminDogWriteDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  UpdateAdminDogRequest,
  UpdateAdminDogResponse,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { normalizeDistinctNames } from "./normalization";
import { isPrismaUniqueConstraintError } from "./internal/prisma-errors";
import {
  dogNotFoundResponse,
  duplicateDogResponse,
  updateInternalErrorResponse,
  updateSuccessResponse,
} from "./internal/manage-responses";
import {
  validateUpdateInTry,
  validateUpdatePreflight,
} from "./internal/update-input-validation";
import {
  resolveUpdateParents,
  validateUpdateParentGuards,
} from "./internal/update-parent-validation";

const DOG_NAME_MAX_LENGTH = 120;
const DOG_REGISTRATION_NO_MAX_LENGTH = 40;
const DOG_NOTE_MAX_LENGTH = 500;

function isDogNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message === "DOG_NOT_FOUND";
}

export async function updateAdminDog(
  input: UpdateAdminDogRequest,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<UpdateAdminDogResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.updateAdminDog",
    ...(auditContext?.actorUserId
      ? { actorUserId: auditContext.actorUserId }
      : {}),
  });

  log.info(
    {
      event: "start",
      dogId: input.id,
      sex: input.sex,
      hasBirthDate: Boolean(input.birthDate),
      hasRegistrationNo: Boolean(input.registrationNo),
      hasOwnerNames: input.ownerNames !== undefined,
      ownerCount: normalizeDistinctNames(input.ownerNames).length,
    },
    "admin dog update started",
  );

  const preflight = validateUpdatePreflight(
    input,
    DOG_NAME_MAX_LENGTH,
    DOG_REGISTRATION_NO_MAX_LENGTH,
  );
  if (!preflight.ok) {
    log.warn(
      {
        ...preflight.logContext,
        durationMs: Date.now() - startedAt,
      },
      preflight.logMessage,
    );
    return preflight.response;
  }

  try {
    const inTryValidation = validateUpdateInTry(
      input,
      preflight.data.id,
      DOG_NOTE_MAX_LENGTH,
    );
    if (!inTryValidation.ok) {
      log.warn(
        {
          ...inTryValidation.logContext,
          durationMs: Date.now() - startedAt,
        },
        inTryValidation.logMessage,
      );
      return inTryValidation.response;
    }

    const resolvedParents = await resolveUpdateParents(
      inTryValidation.data.sireRegistrationNo,
      inTryValidation.data.damRegistrationNo,
    );
    if (!resolvedParents.ok) {
      return resolvedParents.response;
    }

    const existingDog = await findDogByIdDb(preflight.data.id);
    if (!existingDog) {
      return dogNotFoundResponse();
    }

    const parentGuardResult = validateUpdateParentGuards(
      preflight.data.id,
      existingDog,
      resolvedParents.data.sire,
      resolvedParents.data.dam,
    );
    if (!parentGuardResult.ok) {
      return parentGuardResult.response;
    }

    const updatedDog = await runAdminDogWriteTransactionDb(
      async (tx) =>
        updateAdminDogWriteDb(
          {
            id: preflight.data.id,
            name: preflight.data.name,
            sex: preflight.data.sex,
            birthDate: preflight.data.birthDate,
            breederNameText: inTryValidation.data.breederNameText,
            sireId:
              resolvedParents.data.sire === undefined
                ? undefined
                : (resolvedParents.data.sire?.id ?? null),
            damId:
              resolvedParents.data.dam === undefined
                ? undefined
                : (resolvedParents.data.dam?.id ?? null),
            ownerNames: inTryValidation.data.ownerNames,
            ekNo: preflight.data.ekNo,
            note: inTryValidation.data.note,
            registrationNo: preflight.data.primaryRegistrationNo,
            secondaryRegistrationNos:
              input.secondaryRegistrationNos === undefined
                ? undefined
                : preflight.data.secondaryRegistrationNos,
            titles:
              inTryValidation.data.parsedTitles === undefined
                ? undefined
                : inTryValidation.data.parsedTitles.titles,
          },
          tx,
        ),
      { ...auditContext, intent: "UPDATE_DOG" },
    );

    log.info(
      {
        event: "success",
        dogId: updatedDog.id,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update succeeded",
    );

    return updateSuccessResponse(updatedDog);
  } catch (error) {
    if (isDogNotFoundError(error)) {
      log.warn(
        {
          event: "dog_not_found",
          dogId: preflight.data.id,
          durationMs: Date.now() - startedAt,
        },
        "admin dog update failed because dog was not found",
      );
      return dogNotFoundResponse();
    }

    if (isPrismaUniqueConstraintError(error)) {
      log.warn(
        {
          event: "duplicate_dog",
          dogId: preflight.data.id,
          durationMs: Date.now() - startedAt,
        },
        "admin dog update rejected because duplicate dog exists",
      );
      return duplicateDogResponse();
    }

    log.error(
      {
        event: "exception",
        dogId: preflight.data.id,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog update failed",
    );

    return updateInternalErrorResponse();
  }
}
