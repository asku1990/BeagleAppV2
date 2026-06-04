import {
  createAdminDogDiseaseDb,
  findAdminDiseaseDogByRegistrationNoDb,
  findAdminDogDiseaseDefinitionByCodeDb,
  findAdminDogDiseaseDuplicateDb,
  runAdminDogDiseaseWriteTransactionDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  CurrentUserDto,
  CreateAdminDogDiseaseRequest,
  CreateAdminDogDiseaseResponse,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { isValidRegistrationNo } from "@server/admin/dogs/manage/normalization";
import {
  validateCreateDogDiseaseInput,
  type CreateDogDiseaseValidationResult,
} from "./internal/create-disease-validation";
import { isLegacySyntheticDiseaseRegistration } from "./internal/synthetic-registration";

function validationResponse(
  validation: Extract<CreateDogDiseaseValidationResult, { ok: false }>,
): ServiceResult<CreateAdminDogDiseaseResponse> {
  return {
    status: 400,
    body: {
      ok: false,
      error: validation.error,
      code: validation.code,
    },
  };
}

function duplicateResponse(): ServiceResult<CreateAdminDogDiseaseResponse> {
  return {
    status: 400,
    body: {
      ok: false,
      code: "DISEASE_ROW_ALREADY_EXISTS",
      error: "Disease evidence already exists.",
    },
  };
}

export async function createAdminDogDisease(
  input: CreateAdminDogDiseaseRequest,
  currentUser: CurrentUserDto | null,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<CreateAdminDogDiseaseResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.createAdminDogDisease",
    ...(auditContext?.actorUserId
      ? { actorUserId: auditContext.actorUserId }
      : {}),
  });

  log.info(
    {
      event: "start",
      evidenceKind: input.evidenceKind,
      hasRegistrationNo: Boolean(input.registrationNo),
      hasSireRegistrationNo: Boolean(input.sireRegistrationNo),
      hasDamRegistrationNo: Boolean(input.damRegistrationNo),
    },
    "admin dog disease create started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog disease create rejected by authorization",
    );
    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  const validation = validateCreateDogDiseaseInput(input);
  if (!validation.ok) {
    log.warn(
      {
        event: "validation_error",
        code: validation.code,
        durationMs: Date.now() - startedAt,
      },
      "admin dog disease create rejected by validation",
    );
    return validationResponse(validation);
  }

  try {
    const created = await runAdminDogDiseaseWriteTransactionDb(
      async (tx) => {
        const disease = await findAdminDogDiseaseDefinitionByCodeDb(
          validation.data.diseaseCode,
          tx,
        );
        if (!disease) {
          throw new Error("DISEASE_NOT_FOUND");
        }

        const dog = await findAdminDiseaseDogByRegistrationNoDb(
          validation.data.registrationNo,
          tx,
        );

        if (input.evidenceKind === "DOG") {
          if (!dog) {
            throw new Error("DOG_NOT_FOUND");
          }

          const existing = await findAdminDogDiseaseDuplicateDb(
            {
              evidenceKind: "DOG",
              dogId: dog.id,
              sairausId: disease.id,
              rekisterinumero: validation.data.registrationNo,
              isaRekisterinumero: null,
              emaRekisterinumero: null,
            },
            tx,
          );
          if (existing) {
            throw new Error("DISEASE_ROW_ALREADY_EXISTS");
          }

          return createAdminDogDiseaseDb(
            {
              evidenceKind: "DOG",
              dogId: dog.id,
              rekisterinumero: validation.data.registrationNo,
              isaRekisterinumero: null,
              emaRekisterinumero: null,
              sairausId: disease.id,
              sairausKoodi: disease.koodi,
              pentue: validation.data.litter,
              kuvaus: validation.data.description,
              julkinen: input.public,
              tietolahde: validation.data.source,
            },
            tx,
          );
        }

        if (
          dog ||
          (isValidRegistrationNo(validation.data.registrationNo) &&
            !isLegacySyntheticDiseaseRegistration(
              validation.data.registrationNo,
              disease.koodi,
            ))
        ) {
          throw new Error("INVALID_LITTER_REGISTRATION_NO");
        }

        const sire = validation.data.sireRegistrationNo
          ? await findAdminDiseaseDogByRegistrationNoDb(
              validation.data.sireRegistrationNo,
              tx,
            )
          : null;
        const dam = validation.data.damRegistrationNo
          ? await findAdminDiseaseDogByRegistrationNoDb(
              validation.data.damRegistrationNo,
              tx,
            )
          : null;

        if (!sire || !dam) {
          throw new Error("LITTER_PARENT_NOT_FOUND");
        }

        const existing = await findAdminDogDiseaseDuplicateDb(
          {
            evidenceKind: "LITTER",
            dogId: null,
            sairausId: disease.id,
            rekisterinumero: validation.data.registrationNo,
            isaRekisterinumero: validation.data.sireRegistrationNo,
            emaRekisterinumero: validation.data.damRegistrationNo,
          },
          tx,
        );
        if (existing) {
          throw new Error("DISEASE_ROW_ALREADY_EXISTS");
        }

        return createAdminDogDiseaseDb(
          {
            evidenceKind: "LITTER",
            dogId: null,
            rekisterinumero: validation.data.registrationNo,
            isaRekisterinumero: validation.data.sireRegistrationNo,
            emaRekisterinumero: validation.data.damRegistrationNo,
            sairausId: disease.id,
            sairausKoodi: disease.koodi,
            pentue: validation.data.litter,
            kuvaus: validation.data.description,
            julkinen: input.public,
            tietolahde: validation.data.source,
          },
          tx,
        );
      },
      { ...auditContext, intent: "CREATE_DOG_DISEASE" },
    );

    log.info(
      {
        event: "success",
        diseaseRowId: created.id,
        durationMs: Date.now() - startedAt,
      },
      "admin dog disease create succeeded",
    );

    return {
      status: 201,
      body: {
        ok: true,
        data: created,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errorMap: Record<string, { code: string; error: string }> = {
      DISEASE_NOT_FOUND: {
        code: "DISEASE_NOT_FOUND",
        error: "Disease was not found.",
      },
      DISEASE_ROW_ALREADY_EXISTS: {
        code: "DISEASE_ROW_ALREADY_EXISTS",
        error: "Disease evidence already exists.",
      },
      DOG_NOT_FOUND: {
        code: "DOG_NOT_FOUND",
        error: "Dog was not found.",
      },
      INVALID_LITTER_REGISTRATION_NO: {
        code: "INVALID_LITTER_REGISTRATION_NO",
        error:
          "Litter evidence requires an anonymous or synthetic registration number.",
      },
      LITTER_PARENT_NOT_FOUND: {
        code: "LITTER_PARENT_NOT_FOUND",
        error: "Litter sire and dam must both resolve to dogs.",
      },
    };
    const mappedError = errorMap[message];
    if (mappedError) {
      if (mappedError.code === "DISEASE_ROW_ALREADY_EXISTS") {
        log.warn(
          {
            event: "duplicate",
            durationMs: Date.now() - startedAt,
          },
          "admin dog disease create rejected because duplicate evidence exists",
        );
        return duplicateResponse();
      }

      log.warn(
        {
          event: "business_error",
          code: mappedError.code,
          durationMs: Date.now() - startedAt,
        },
        "admin dog disease create rejected by business rules",
      );

      return {
        status: 400,
        body: {
          ok: false,
          ...mappedError,
        },
      };
    }

    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog disease create failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to create admin dog disease.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
