import { describe, expect, it } from "vitest";
import { encodeTrialId, parseTrialId } from "../trial-id";

describe("trial id", () => {
  it("round-trips encoded payload", () => {
    const trialId = encodeTrialId("2025-06-01", "Helsinki");
    const parsed = parseTrialId(trialId);

    expect(parsed).toEqual({
      eventDateIsoDate: "2025-06-01",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });
  });

  it("rejects blank input", () => {
    expect(parseTrialId("   ")).toBeNull();
  });

  it("rejects invalid base64url", () => {
    expect(parseTrialId("%%%")).toBeNull();
  });
});
