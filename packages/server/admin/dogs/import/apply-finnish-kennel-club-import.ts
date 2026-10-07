import { createHash } from "node:crypto";
import {
  applyDogImportPlanDb,
  loadDogImportStateDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  AdminFinnishKennelClubImportApplyResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import type { ServiceResult } from "@server/core/result";
import { isPrismaTransactionTimeoutError } from "@server/core/prisma-transaction-timeout";
import { parseFinnishKennelClubWorkbook } from "./internal/sources/finnish-kennel-club/parse-finnish-kennel-club-workbook";
import { evaluateDogImportRows } from "./internal/runtime/evaluate-dog-import-rows";
import { DOG_IMPORT_POLICY_VERSION } from "./internal/policy/dog-import-policy";
import { DOG_IMPORT_MAX_FILE_BYTES } from "./preview-finnish-kennel-club-import";

const MAX_SERIALIZABLE_RETRIES = 2;

const isSerializableTransactionError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "P2034";

const isExpectedConflictError = (error: unknown) =>
  isSerializableTransactionError(error) ||
  (typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002");

export async function applyFinnishKennelClubDogImport(
  input: {
    bytes: Buffer;
    sourceFileSha256: string;
    previewDigest: string;
    audit: AuditContextDb;
  },
  user: CurrentUserDto | null,
): Promise<ServiceResult<AdminFinnishKennelClubImportApplyResponse>> {
  const auth = requireAdmin(user);
  if (!auth.body.ok)
    return auth as unknown as ServiceResult<AdminFinnishKennelClubImportApplyResponse>;
  if (
    createHash("sha256").update(input.bytes).digest("hex") !==
    input.sourceFileSha256
  )
    return {
      status: 409,
      body: {
        ok: false,
        code: "SOURCE_FILE_CHANGED",
        error: "Workbook bytes differ from the reviewed file.",
      },
    };
  if (
    input.bytes.byteLength === 0 ||
    input.bytes.byteLength > DOG_IMPORT_MAX_FILE_BYTES
  )
    return {
      status: input.bytes.byteLength > DOG_IMPORT_MAX_FILE_BYTES ? 413 : 400,
      body: {
        ok: false,
        code: "SOURCE_RESOURCE_LIMIT_EXCEEDED",
        error: "Workbook exceeds the supported limit.",
      },
    };
  let parsed: ReturnType<typeof parseFinnishKennelClubWorkbook>;
  try {
    parsed = parseFinnishKennelClubWorkbook(input.bytes);
  } catch {
    return {
      status: 400,
      body: {
        ok: false,
        code: "SOURCE_FILE_UNREADABLE",
        error: "Workbook could not be read.",
      },
    };
  }
  if (parsed.rows.length > 10_000)
    return {
      status: 400,
      body: {
        ok: false,
        code: "SOURCE_RESOURCE_LIMIT_EXCEEDED",
        error: "Workbook has too many populated rows.",
      },
    };
  const registrations = parsed.rows
    .flatMap((row) => [
      row.registrationNo,
      row.sireRegistrationNo,
      row.damRegistrationNo,
    ])
    .filter((value): value is string => Boolean(value));
  let evaluation: ReturnType<typeof evaluateDogImportRows>;
  try {
    evaluation = evaluateDogImportRows(
      parsed.rows,
      await loadDogImportStateDb(registrations),
      parsed.facts,
    );
  } catch {
    return {
      status: 500,
      body: {
        ok: false,
        code: "IMPORT_EVALUATION_FAILED",
        error: "The import could not be evaluated.",
      },
    };
  }
  if (evaluation.previewDigest !== input.previewDigest)
    return {
      status: 409,
      body: {
        ok: false,
        code: "PREVIEW_STALE",
        error: "The reviewed import is stale. Validate it again.",
      },
    };
  if (!evaluation.applyAllowed)
    return {
      status: 422,
      body: {
        ok: false,
        code: "IMPORT_BLOCKED",
        error: "The import contains blocking issues and cannot be applied.",
      },
    };
  try {
    let written;
    for (let attempt = 0; ; attempt += 1) {
      try {
        written = await applyDogImportPlanDb(evaluation.plan, {
          ...input.audit,
          source: "WEB",
          intent: "IMPORT_FINNISH_DOG_REGISTRATIONS",
        });
        break;
      } catch (error) {
        if (
          isSerializableTransactionError(error) &&
          attempt < MAX_SERIALIZABLE_RETRIES
        )
          continue;
        throw error;
      }
    }
    return {
      status: 200,
      body: {
        ok: true,
        data: {
          success: true,
          policyVersion: DOG_IMPORT_POLICY_VERSION,
          createdCount: written.createdCount,
          updatedCount: written.updatedCount,
          unchangedCount: evaluation.unchangedCount,
          referenceCount: written.referenceCount,
          issues: evaluation.issues,
        },
      },
    };
  } catch (error) {
    const stale =
      (error instanceof Error && error.message === "DOG_IMPORT_STALE") ||
      isExpectedConflictError(error);
    const timeout = isPrismaTransactionTimeoutError(error);
    return {
      status: stale || timeout ? 409 : 500,
      body: {
        ok: false,
        code: stale || timeout ? "PREVIEW_STALE" : "IMPORT_WRITE_FAILED",
        error:
          stale || timeout
            ? "The reviewed import is stale. Validate it again."
            : "The import could not be applied.",
      },
    };
  }
}
