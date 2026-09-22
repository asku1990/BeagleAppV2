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
import { parseFinnishKennelClubWorkbook } from "./internal/sources/finnish-kennel-club/parse-finnish-kennel-club-workbook";
import { evaluateDogImportRows } from "./internal/runtime/evaluate-dog-import-rows";
import { DOG_IMPORT_POLICY_VERSION } from "./internal/policy/dog-import-policy";

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
  try {
    const parsed = parseFinnishKennelClubWorkbook(input.bytes);
    const registrations = parsed.rows
      .flatMap((row) => [
        row.registrationNo,
        row.sireRegistrationNo,
        row.damRegistrationNo,
      ])
      .filter((value): value is string => Boolean(value));
    const evaluation = evaluateDogImportRows(
      parsed.rows,
      await loadDogImportStateDb(registrations),
      parsed.facts,
    );
    if (
      evaluation.previewDigest !== input.previewDigest ||
      !evaluation.applyAllowed
    )
      return {
        status: 409,
        body: {
          ok: false,
          code: "PREVIEW_STALE",
          error: "The reviewed import is stale. Validate it again.",
        },
      };
    const written = await applyDogImportPlanDb(evaluation.plan, {
      ...input.audit,
      source: "WEB",
      intent: "IMPORT_FINNISH_DOG_REGISTRATIONS",
    });
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
    return {
      status: String(error).includes("DOG_IMPORT_STALE") ? 409 : 500,
      body: {
        ok: false,
        code: "PREVIEW_STALE",
        error: "The import could not be applied. Validate it again.",
      },
    };
  }
}
