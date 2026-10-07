import type { NextRequest } from "next/server";
import { applyFinnishKennelClubDogImport } from "@beagle/server";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { toAdminUserContext } from "@/lib/server/admin-user-context";
import { jsonResponse } from "@/lib/server/cors";

export async function POST(request: NextRequest) {
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
  const previewDigest = form.get("previewDigest");
  const sourceFileSha256 = form.get("sourceFileSha256");
  if (
    !(file instanceof File) ||
    file.size > 10 * 1024 * 1024 ||
    typeof previewDigest !== "string" ||
    typeof sourceFileSha256 !== "string"
  )
    return jsonResponse(
      {
        ok: false,
        error: "A reviewed .xlsx workbook is required.",
        code: "SOURCE_FILE_UNREADABLE",
      },
      { status: 400 },
    );
  const result = await applyFinnishKennelClubDogImport(
    {
      bytes: Buffer.from(await file.arrayBuffer()),
      previewDigest,
      sourceFileSha256,
      audit: {
        actorUserId: user.id,
        actorSessionId: user.sessionId,
        requestId: request.headers.get("x-request-id"),
      },
    },
    toAdminUserContext(user),
  );
  return jsonResponse(result.body, { status: result.status });
}
