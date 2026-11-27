import { Readable } from "node:stream";
import { deflateRawSync } from "node:zlib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readBoundedWorkbookArchive,
  WorkbookArchiveLimitError,
} from "../read-bounded-workbook-archive";

const { openZip } = vi.hoisted(() => ({ openZip: vi.fn() }));
vi.mock("yauzl", () => ({ fromBufferPromise: openZip }));

const MiB = 1024 * 1024;
const chunk = Buffer.alloc(MiB);

type Part = {
  fileName: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod?: number;
  chunks: Buffer[];
};

function mockArchive(parts: Part[]) {
  const archive = {
    entryCount: parts.length,
    async *eachEntry() {
      for (const part of parts)
        yield { compressionMethod: 0, ...part, canDecodeFileData: () => true };
    },
    openReadStreamPromise: vi.fn(async (part: Part) =>
      Readable.from(part.chunks, { objectMode: true }),
    ),
    close: vi.fn(),
  };
  openZip.mockResolvedValue(archive);
  return archive;
}

describe("readBoundedWorkbookArchive", () => {
  beforeEach(() => {
    openZip.mockReset();
  });

  it("enforces the ratio against actual output and closes the archive", async () => {
    const archive = mockArchive([
      {
        fileName: "[Content_Types].xml",
        compressedSize: 1,
        uncompressedSize: 100,
        chunks: [Buffer.alloc(101)],
      },
    ]);

    await expect(readBoundedWorkbookArchive(Buffer.alloc(0))).rejects.toThrow(
      WorkbookArchiveLimitError,
    );
    expect(archive.openReadStreamPromise).toHaveBeenCalledTimes(1);
    expect(archive.close).toHaveBeenCalledOnce();
  });

  it("enforces the entry limit even if the reported size is in budget", async () => {
    const archive = mockArchive([
      {
        fileName: "[Content_Types].xml",
        compressedSize: 21 * MiB,
        uncompressedSize: 20 * MiB,
        chunks: Array<Buffer>(21).fill(chunk),
      },
    ]);

    await expect(readBoundedWorkbookArchive(Buffer.alloc(0))).rejects.toThrow(
      WorkbookArchiveLimitError,
    );
    expect(archive.openReadStreamPromise).toHaveBeenCalledTimes(1);
    expect(archive.close).toHaveBeenCalledOnce();
  });

  it("counts actual expanded bytes across entries", async () => {
    const archive = mockArchive(
      [20, 20, 10].map((size, index) => ({
        fileName: `part-${index}.xml`,
        compressedSize: (index === 2 ? size + 1 : size) * MiB,
        uncompressedSize: size * MiB,
        chunks: Array<Buffer>(index === 2 ? size + 1 : size).fill(chunk),
      })),
    );

    await expect(readBoundedWorkbookArchive(Buffer.alloc(0))).rejects.toThrow(
      WorkbookArchiveLimitError,
    );
    expect(archive.openReadStreamPromise).toHaveBeenCalledTimes(3);
    expect(archive.close).toHaveBeenCalledOnce();
  });

  it("does not count unused trailing bytes toward the expansion ratio", async () => {
    const content = Buffer.alloc(16 * 1024, "a");
    const deflated = deflateRawSync(content);
    const input = Buffer.concat([deflated, Buffer.alloc(256)]);
    const archive = mockArchive([
      {
        fileName: "[Content_Types].xml",
        compressionMethod: 8,
        compressedSize: input.length,
        uncompressedSize: content.length,
        chunks: [input],
      },
    ]);

    await expect(readBoundedWorkbookArchive(Buffer.alloc(0))).rejects.toThrow(
      WorkbookArchiveLimitError,
    );
    expect(archive.close).toHaveBeenCalledOnce();
  });

  it("rejects a compressed-size mismatch even within the ratio limit", async () => {
    const content = Buffer.from("workbook part");
    const deflated = deflateRawSync(content);
    const input = Buffer.concat([deflated, Buffer.alloc(1)]);
    mockArchive([
      {
        fileName: "[Content_Types].xml",
        compressionMethod: 8,
        compressedSize: input.length,
        uncompressedSize: content.length,
        chunks: [input],
      },
    ]);

    await expect(readBoundedWorkbookArchive(Buffer.alloc(0))).rejects.toThrow(
      "Invalid workbook part size.",
    );
  });
});
