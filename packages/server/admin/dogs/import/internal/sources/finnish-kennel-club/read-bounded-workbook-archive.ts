import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createInflateRaw } from "node:zlib";
import * as XLSX from "xlsx";
import { fromBufferPromise } from "yauzl";

const MAX_EXPANDED_BYTES = 50 * 1024 * 1024;
const MAX_ENTRY_BYTES = 20 * 1024 * 1024;
const MAX_EXPANSION_RATIO = 100;
const MAX_ENTRIES = 2_048;

// SheetJS exposes its ZIP writer via CFB; narrow its untyped API here.
type ZipWriter<Archive> = {
  utils: {
    cfb_new(): Archive;
    cfb_add(
      archive: Archive,
      path: string,
      content: Buffer,
      options: { unsafe: true },
    ): void;
  };
  write(
    archive: Archive,
    options: { fileType: "zip"; type: "buffer"; compression: false },
  ): Buffer;
};
const zipWriter = XLSX.CFB as ZipWriter<object>;

export class WorkbookArchiveLimitError extends Error {}

/** Expands bounded ZIP entries and repacks them without compression for SheetJS. */
export async function readBoundedWorkbookArchive(bytes: Buffer) {
  const zip = await fromBufferPromise(bytes, {
    lazyEntries: true,
    autoClose: false,
    strictFileNames: true,
    // Check actual bytes ourselves so budget violations have a distinct result.
    validateEntrySizes: false,
  });
  try {
    if (zip.entryCount > MAX_ENTRIES) throw new WorkbookArchiveLimitError();

    const archive = zipWriter.utils.cfb_new();
    const partNames = new Set<string>();
    let totalBytes = 0;
    for await (const entry of zip.eachEntry()) {
      if (!entry.canDecodeFileData())
        throw new Error("Unsupported workbook ZIP entry.");
      const name = entry.fileName.toLowerCase();
      // OOXML part names are ASCII URIs; the ZIP writer only preserves ASCII.
      if (!/^[\x21-\x7e]+$/u.test(name) || partNames.has(name))
        throw new Error("Invalid workbook part name.");
      partNames.add(name);

      const entryLimit = Math.min(
        MAX_ENTRY_BYTES,
        entry.compressedSize * MAX_EXPANSION_RATIO,
      );
      if (
        entry.uncompressedSize > entryLimit ||
        totalBytes + entry.uncompressedSize > MAX_EXPANDED_BYTES
      )
        throw new WorkbookArchiveLimitError();

      const chunks: Buffer[] = [];
      let entryBytes = 0;
      const stream = await zip.openReadStreamPromise(entry, {
        decodeFileData: false,
      });
      const collect = new Writable({
        write(chunk: Buffer, _encoding, callback) {
          entryBytes += chunk.byteLength;
          totalBytes += chunk.byteLength;
          if (entryBytes > entryLimit || totalBytes > MAX_EXPANDED_BYTES) {
            callback(new WorkbookArchiveLimitError());
            return;
          }
          chunks.push(chunk);
          callback();
        },
      });
      const inflater =
        entry.compressionMethod === 8 ? createInflateRaw() : null;
      if (inflater) await pipeline(stream, inflater, collect);
      else await pipeline(stream, collect);

      // bytesWritten counts the input used by zlib, excluding trailing bytes.
      const compressedBytes = inflater?.bytesWritten ?? entryBytes;
      if (entryBytes > compressedBytes * MAX_EXPANSION_RATIO)
        throw new WorkbookArchiveLimitError();

      if (
        compressedBytes !== entry.compressedSize ||
        entryBytes !== entry.uncompressedSize ||
        (name.endsWith("/") && entryBytes !== 0)
      )
        throw new Error("Invalid workbook part size.");
      if (!name.endsWith("/") && entryBytes > 0)
        zipWriter.utils.cfb_add(
          archive,
          entry.fileName,
          Buffer.concat(chunks, entryBytes),
          { unsafe: true },
        );
    }

    if (!partNames.has("[content_types].xml"))
      throw new Error("Workbook package metadata is missing.");

    return zipWriter.write(archive, {
      fileType: "zip",
      type: "buffer",
      compression: false,
    });
  } finally {
    zip.close();
  }
}
