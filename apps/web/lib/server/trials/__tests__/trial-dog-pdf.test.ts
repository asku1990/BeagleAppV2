import { describe, expect, it } from "vitest";
import { renderTrialDogPdf } from "../trial-dog-pdf";

describe("renderTrialDogPdf", () => {
  it("renders pdf bytes from a registration number", async () => {
    const bytes = await renderTrialDogPdf({
      registrationNo: "FI12345/21",
      dogName: null,
    });

    expect(Buffer.from(bytes).toString("latin1", 0, 4)).toBe("%PDF");
  });
});
