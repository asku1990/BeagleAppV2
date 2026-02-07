import { describe, expect, it } from "vitest";
import type { ActionResult } from "@beagle/domain";

describe("action contracts", () => {
  it("matches ActionResult type shape", () => {
    const result: ActionResult<{ ok: boolean }> = {
      ok: true,
      data: { ok: true },
    };
    expect(result.ok).toBe(true);
  });
});
