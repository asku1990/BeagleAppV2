import {
  createAdminDogWriteDb,
  runAdminDogWriteTransactionDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  CreateAdminDogRequest,
  CreateAdminDogResponse,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { normalizeDistinctNames } from "./normalization";
import { isPrismaUniqueConstraintError } from "./internal/prisma-errors";
import {
  createInternalErrorResponse,
  createSuccessResponse,
  duplicateDogResponse,
} from "./internal/manage-responses";
import {
  validateCreateInTry,
  validateCreatePreflight,
} from "./internal/create-input-validation";
import { resolveAndValidateCreateParents } from "./internal/create-parent-validation";

const DOG_NAME_MAX_LENGTH = 120;
const DOG_REGISTRATION_NO_MAX_LENGTH = 40;
const DOG_NOTE_MAX_LENGTH = 500;

export async function createAdminDog(
  input: CreateAdminDogRequest,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<CreateAdminDogResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.createAdminDog",
    ...(auditContext?.actorUserId
      ? { actorUserId: auditContext.actorUserId }
      : {}),
  });

  log.info(
    {
      event: "start",
      sex: input.sex,
      hasBirthDate: Boolean(input.birthDate),
      hasRegistrationNo: Boolean(input.registrationNo),
      ownerCount: normalizeDistinctNames(input.ownerNames).length,
    },
    "admin dog create started",
  );

  const preflight = validateCreatePreflight(
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
    const inTryValidation = validateCreateInTry(input, DOG_NOTE_MAX_LENGTH);
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

    const parentValidation = await resolveAndValidateCreateParents(input);
    if (!parentValidation.ok) {
      return parentValidation.response;
    }

    const createdDog = await runAdminDogWriteTransactionDb(
      async (tx) =>
        createAdminDogWriteDb(
          {
            name: preflight.data.name,
            sex: preflight.data.sex,
            birthDate: preflight.data.birthDate,
            breederNameText: inTryValidation.data.breederNameText,
            sireId: parentValidation.data.sire?.id ?? null,
            damId: parentValidation.data.dam?.id ?? null,
            ownerNames: inTryValidation.data.ownerNames,
            ekNo: preflight.data.ekNo,
            note: inTryValidation.data.note,
            registrationNo: preflight.data.primaryRegistrationNo,
            secondaryRegistrationNos: preflight.data.secondaryRegistrationNos,
            titles: inTryValidation.data.parsedTitles.titles,
          },
          tx,
        ),
      { ...auditContext, intent: "CREATE_DOG" },
    );

    log.info(
      {
        event: "success",
        dogId: createdDog.id,
        durationMs: Date.now() - startedAt,
      },
      "admin dog create succeeded",
    );

    return createSuccessResponse(createdDog);
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      log.warn(
        { event: "duplicate_dog", durationMs: Date.now() - startedAt },
        "admin dog create rejected because duplicate dog exists",
      );
      return duplicateDogResponse();
    }

    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog create failed",
    );

    return createInternalErrorResponse();
  }
}
