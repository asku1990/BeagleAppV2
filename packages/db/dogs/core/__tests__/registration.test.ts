import { describe, expect, it } from "vitest";
import {
  compareByRegistrationDesc,
  getFirstInsertedRegistrationNo,
  getLatestRegistrationNo,
  sortRegistrationsByInsertedAsc,
  sortRegistrationsDesc,
} from "../registration";

describe("dogs/core/registration", () => {
  it("sorts by parsed year and sequence when both registrations are parseable", () => {
    expect(compareByRegistrationDesc("FI-11/25", "FI-10/24")).toBeLessThan(0);
    expect(compareByRegistrationDesc("FI-11/24", "FI-10/24")).toBeLessThan(0);
  });

  it("falls back to locale compare when parsing is not possible", () => {
    expect(compareByRegistrationDesc("abc", "def")).toBeGreaterThan(0);
  });

  it("sorts rows by newest createdAt first and then registration order", () => {
    const rows = sortRegistrationsDesc([
      { registrationNo: "FI-10/24", createdAt: new Date("2026-01-01") },
      { registrationNo: "FI-11/24", createdAt: new Date("2026-01-01") },
      { registrationNo: "FI-12/24", createdAt: new Date("2026-01-02") },
    ]);

    expect(rows.map((row) => row.registrationNo)).toEqual([
      "FI-12/24",
      "FI-11/24",
      "FI-10/24",
    ]);
  });

  it("sorts rows by oldest createdAt when selecting first inserted", () => {
    const rows = sortRegistrationsByInsertedAsc([
      { registrationNo: "FI-10/24", createdAt: new Date("2026-01-01") },
      { registrationNo: "FI-11/24", createdAt: new Date("2026-01-01") },
      { registrationNo: "FI-12/24", createdAt: new Date("2026-01-02") },
    ]);

    expect(rows.map((row) => row.registrationNo)).toEqual([
      "FI-10/24",
      "FI-11/24",
      "FI-12/24",
    ]);
    expect(getFirstInsertedRegistrationNo(rows)).toBe("FI-10/24");
  });

  it("returns null when asking latest registration from empty list", () => {
    expect(getLatestRegistrationNo([])).toBeNull();
  });
});
