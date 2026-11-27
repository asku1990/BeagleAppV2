import type { NextRequest } from "next/server";
import { previewFinnishKennelClubDogImport } from "@beagle/server";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { toAdminUserContext } from "@/lib/server/admin-user-context";
import { jsonResponse } from "@/lib/server/cors";
import { readDogImportUpload } from "@/lib/server/admin/dogs/import/read-dog-import-upload";

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
  const upload = await readDogImportUpload(request);
  if (!upload.ok) return upload.response;
  const { file } = upload;
  const result = await previewFinnishKennelClubDogImport(
    { bytes: Buffer.from(await file.arrayBuffer()), fileName: file.name },
    toAdminUserContext(user),
  );
  return jsonResponse(result.body, { status: result.status });
}
