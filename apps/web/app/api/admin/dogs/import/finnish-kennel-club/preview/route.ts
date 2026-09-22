import type { NextRequest } from "next/server";
import { previewFinnishKennelClubDogImport } from "@beagle/server";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { toAdminUserContext } from "@/lib/server/admin-user-context";
import { jsonResponse } from "@/lib/server/cors";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_FILE_BYTES + 32_768)
    return jsonResponse(
      {
        ok: false,
        error: "Workbook exceeds 10 MiB.",
        code: "SOURCE_RESOURCE_LIMIT_EXCEEDED",
      },
      { status: 413 },
    );
  const user = await getSessionCurrentUser();
  if (!user || user.role !== "ADMIN")
    return jsonResponse(
      {
        ok: false,
        error: "Admin role required.",
        code: user ? "FORBIDDEN" : "UNAUTHENTICATED",
      },
      { status: user ? 403 : 401 },
    );
  const form = await request.formData();
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    !file.name.toLocaleLowerCase("fi-FI").endsWith(".xlsx")
  )
    return jsonResponse(
      {
        ok: false,
        error: "An .xlsx workbook is required.",
        code: "SOURCE_FILE_UNREADABLE",
      },
      { status: 400 },
    );
  if (file.size > MAX_FILE_BYTES)
    return jsonResponse(
      {
        ok: false,
        error: "Workbook exceeds 10 MiB.",
        code: "SOURCE_RESOURCE_LIMIT_EXCEEDED",
      },
      { status: 413 },
    );
  const result = await previewFinnishKennelClubDogImport(
    { bytes: Buffer.from(await file.arrayBuffer()), fileName: file.name },
    toAdminUserContext(user),
  );
  return jsonResponse(result.body, { status: result.status });
}
