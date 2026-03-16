import { describe, expect, it } from "vitest";
import { normalizeShowResult } from "../normalize-show-result";

describe("normalizeShowResult", () => {
  it("keeps parser mode pre-2003 values as raw legacy tokens", () => {
    const result = normalizeShowResult("KÄY2, KÄK1", "1996-01-06");
    expect(result).toBe("KÄY2, KÄK1");
  });

  it("formats display mode pre-2003 class+digit values as class-digit", () => {
    const result = normalizeShowResult("KAY2,KÄY1", "1996-01-06", {
      mode: "display",
    });
    expect(result).toBe("KÄY-2,KÄY-1");
  });

  it("converts post-2003 legacy class+digit values to modern quality labels", () => {
    const result = normalizeShowResult("JUN1,AVO2", "2003-01-01", {
      mode: "display",
    });
    expect(result).toBe("JUN-ERI,AVO-EH");
  });
});
