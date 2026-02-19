import { describe, expect, it, vi } from "vitest";
import { getImportRun } from "../imports/get-import-run";
import { getImportRunIssues } from "../imports/get-import-run-issues";

describe("imports api helpers", () => {
  it("calls getImportRun with expected path and method", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await getImportRun(requestMock, "run-1");

    expect(requestMock).toHaveBeenCalledWith("/api/v1/imports/run-1", {
      method: "GET",
    });
  });

  it("builds getImportRunIssues query params from options", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await getImportRunIssues(requestMock, "run-1", {
      stage: "PARSE",
      code: "INVALID_VALUE",
      severity: "error",
      cursor: "next-1",
      limit: 25,
    });

    expect(requestMock).toHaveBeenCalledWith(
      "/api/v1/imports/run-1/issues?stage=PARSE&code=INVALID_VALUE&severity=error&cursor=next-1&limit=25",
      { method: "GET" },
    );
  });

  it("omits query string when no options are provided", async () => {
    const requestMock = vi.fn().mockResolvedValue({ ok: true, data: {} });

    await getImportRunIssues(requestMock, "run-1");

    expect(requestMock).toHaveBeenCalledWith("/api/v1/imports/run-1/issues", {
      method: "GET",
    });
  });
});
