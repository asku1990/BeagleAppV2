import { createHash } from "node:crypto";
import { loadDogImportStateDb } from "@beagle/db";
import type {
  AdminFinnishKennelClubImportPreviewResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import type { ServiceResult } from "@server/core/result";
import { parseFinnishKennelClubWorkbook } from "./internal/sources/finnish-kennel-club/parse-finnish-kennel-club-workbook";
import { evaluateDogImportRows } from "./internal/runtime/evaluate-dog-import-rows";
import { DOG_IMPORT_POLICY_VERSION } from "./internal/policy/dog-import-policy";

export const DOG_IMPORT_MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function previewFinnishKennelClubDogImport(
  input: { bytes: Buffer; fileName: string },
  user: CurrentUserDto | null,
): Promise<ServiceResult<AdminFinnishKennelClubImportPreviewResponse>> {
  const auth = requireAdmin(user);
  if (!auth.body.ok)
    return auth as unknown as ServiceResult<AdminFinnishKennelClubImportPreviewResponse>;
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
  try {
    const parsed = parseFinnishKennelClubWorkbook(input.bytes);
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
    const evaluation = evaluateDogImportRows(
      parsed.rows,
      await loadDogImportStateDb(registrations),
      parsed.facts,
    );
    return {
      status: 200,
      body: {
        ok: true,
        data: {
          source: "FINNISH_KENNEL_CLUB",
          fileName: input.fileName,
          sheetName: parsed.sheetName,
          policyVersion: DOG_IMPORT_POLICY_VERSION,
          sourceFileSha256: createHash("sha256")
            .update(input.bytes)
            .digest("hex"),
          previewDigest: evaluation.previewDigest,
          applyAllowed: evaluation.applyAllowed,
          rowCount: parsed.sourceRowCount,
          createCount: evaluation.createCount,
          updateCount: evaluation.updateCount,
          unchangedCount: evaluation.unchangedCount,
          blockedCount: evaluation.blockedCount,
          referenceCount: evaluation.referenceCount,
          issues: evaluation.issues,
          rows: evaluation.rows,
        },
      },
    };
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
}
