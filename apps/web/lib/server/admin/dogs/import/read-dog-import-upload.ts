import { DOG_IMPORT_MAX_FILE_BYTES } from "@beagle/contracts";
import { jsonResponse } from "@/lib/server/cors";

const MAX_REQUEST_BYTES = DOG_IMPORT_MAX_FILE_BYTES + 32 * 1024;

function uploadError(status: 400 | 413) {
  return {
    ok: false as const,
    response: jsonResponse(
      status === 413
        ? {
            ok: false,
            error: "Workbook exceeds the supported upload size.",
            code: "SOURCE_RESOURCE_LIMIT_EXCEEDED",
          }
        : {
            ok: false,
            error: "One nonempty .xlsx workbook is required.",
            code: "SOURCE_FILE_UNREADABLE",
          },
      { status },
    ),
  };
}

/** Reads an authenticated upload, enforcing the request cap before multipart parsing. */
export async function readDogImportUpload(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_REQUEST_BYTES)
    return uploadError(413);

  const contentType = request.headers.get("content-type");
  if (
    !request.body ||
    !contentType ||
    !/^multipart\/form-data\s*;/i.test(contentType)
  )
    return uploadError(400);

  let bytesRead = 0;
  let exceededLimit = false;
  const limitedBody = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytesRead += chunk.byteLength;
        if (bytesRead > MAX_REQUEST_BYTES) {
          exceededLimit = true;
          controller.error(
            new Error("Dog import request exceeds the body limit."),
          );
          return;
        }
        controller.enqueue(chunk);
      },
    }),
  );

  let form: FormData;
  try {
    form = await new Response(limitedBody, {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    return uploadError(exceededLimit ? 413 : 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return uploadError(400);
  if (file.size > DOG_IMPORT_MAX_FILE_BYTES) return uploadError(413);
  const files = [...form.values()].filter((value) => value instanceof File);
  if (
    files.length !== 1 ||
    !file.size ||
    !file.name.toLowerCase().endsWith(".xlsx")
  )
    return uploadError(400);

  return { ok: true as const, file, form };
}
