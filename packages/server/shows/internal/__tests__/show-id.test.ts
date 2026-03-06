import { describe, expect, it } from "vitest";
import { encodeShowId, parseShowId } from "../show-id";

describe("showId", () => {
  it("roundtrips date and place", () => {
    const showId = encodeShowId("2025-06-01", "Helsinki");
    const parsed = parseShowId(showId);

    expect(parsed).toEqual({
      eventDateIsoDate: "2025-06-01",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });
  });

  it("returns null for blank id", () => {
    expect(parseShowId("   ")).toBeNull();
  });

  it("returns null for malformed base64", () => {
    expect(parseShowId("%%%")).toBeNull();
  });
});
