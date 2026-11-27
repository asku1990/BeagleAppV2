import { DOG_IMPORT_MAX_FILE_BYTES } from "@beagle/contracts";
import { describe, expect, it } from "vitest";
import { readDogImportUpload } from "../read-dog-import-upload";

function request(body: FormData | string, headers?: HeadersInit) {
  return new Request("http://localhost/import", {
    method: "POST",
    body,
    headers,
  });
}

function upload(size: number, name = "dogs.xlsx") {
  const form = new FormData();
  form.set("file", new File([new Uint8Array(size)], name));
  return form;
}

describe("readDogImportUpload", () => {
  it("accepts exactly 10 MiB and preserves Apply's text fields", async () => {
    const form = upload(DOG_IMPORT_MAX_FILE_BYTES);
    form.set("previewDigest", "preview-digest");
    form.set("sourceFileSha256", "file-hash");

    const result = await readDogImportUpload(request(form));

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected a valid upload");
    expect(result.file.size).toBe(10_485_760);
    expect(result.form.get("previewDigest")).toBe("preview-digest");
    expect(result.form.get("sourceFileSha256")).toBe("file-hash");
  });

  it("rejects a file one byte over the limit, inside the request allowance", async () => {
    const result = await readDogImportUpload(
      request(upload(DOG_IMPORT_MAX_FILE_BYTES + 1)),
    );

    expect(result).toMatchObject({ ok: false, response: { status: 413 } });
  });

  it("rejects a request above the cap without Content-Length", async () => {
    const form = upload(DOG_IMPORT_MAX_FILE_BYTES);
    form.set("extra", "x".repeat(32 * 1024));
    const incoming = request(form);
    expect(incoming.headers.has("content-length")).toBe(false);

    const result = await readDogImportUpload(incoming);

    expect(result).toMatchObject({ ok: false, response: { status: 413 } });
  });

  it("rejects a declared request above the cap", async () => {
    const result = await readDogImportUpload(
      request(upload(1), {
        "content-length": String(DOG_IMPORT_MAX_FILE_BYTES + 32 * 1024 + 1),
      }),
    );

    expect(result).toMatchObject({ ok: false, response: { status: 413 } });
  });

  it("rejects malformed multipart input", async () => {
    const result = await readDogImportUpload(
      request("invalid body", {
        "content-type": "multipart/form-data; boundary=test",
      }),
    );

    expect(result).toMatchObject({ ok: false, response: { status: 400 } });
  });

  it("rejects an extra file under a different field name", async () => {
    const form = upload(1);
    form.append("extra", new File(["extra"], "extra.xlsx"));

    const result = await readDogImportUpload(request(form));

    expect(result).toMatchObject({ ok: false, response: { status: 400 } });
  });

  it.each([
    [0, "dogs.xlsx"],
    [1, "dogs.csv"],
  ])("rejects an invalid file (%s bytes, %s)", async (size, name) => {
    const result = await readDogImportUpload(request(upload(size, name)));

    expect(result).toMatchObject({ ok: false, response: { status: 400 } });
  });
});
