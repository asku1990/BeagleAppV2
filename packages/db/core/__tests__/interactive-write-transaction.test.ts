import { describe, expect, it } from "vitest";
import { DOG_REGISTRY_IMPORT_TX_CONFIG } from "../interactive-write-transaction";

describe("DOG_REGISTRY_IMPORT_TX_CONFIG", () => {
  it("uses the workbook budget with serializable isolation", () => {
    expect(DOG_REGISTRY_IMPORT_TX_CONFIG).toEqual({
      maxWait: 10_000,
      timeout: 90_000,
      isolationLevel: "Serializable",
    });
  });
});
