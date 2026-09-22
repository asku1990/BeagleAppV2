import type {
  AdminFinnishKennelClubImportApplyResponse,
  AdminFinnishKennelClubImportPreviewResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

export function previewFinnishKennelClubImport(request: RequestFn, file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<AdminFinnishKennelClubImportPreviewResponse>(
    "/api/admin/dogs/import/finnish-kennel-club/preview",
    { method: "POST", body: form },
  );
}
export function applyFinnishKennelClubImport(
  request: RequestFn,
  file: File,
  previewDigest: string,
  sourceFileSha256: string,
) {
  const form = new FormData();
  form.append("file", file);
  form.append("previewDigest", previewDigest);
  form.append("sourceFileSha256", sourceFileSha256);
  return request<AdminFinnishKennelClubImportApplyResponse>(
    "/api/admin/dogs/import/finnish-kennel-club/apply",
    { method: "POST", body: form },
  );
}
