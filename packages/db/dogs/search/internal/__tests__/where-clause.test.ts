import { DogSex } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { buildWhere } from "../where-clause";

describe("dogs/search/internal/where-clause", () => {
  it("returns empty object when no filters are present", () => {
    expect(buildWhere({ ek: "", reg: "", name: "" })).toEqual({});
  });

  it("builds exact ek filter for numeric ek and no wildcard", () => {
    const where = buildWhere({ ek: "123", reg: "", name: "" });
    expect(JSON.stringify(where)).toContain('"ekNo":123');
  });

  it("builds no-match marker for invalid ek without wildcard", () => {
    const where = buildWhere({ ek: "12A", reg: "", name: "" });
    expect(JSON.stringify(where)).toContain("__no_match__");
  });

  it("handles wildcard and plain filters for registration and name", () => {
    const wildcard = buildWhere({ ek: "", reg: "FI-%", name: "%alp%" });
    const plain = buildWhere({ ek: "", reg: "FI-", name: "Alpha" });

    const wildcardJson = JSON.stringify(wildcard);
    const plainJson = JSON.stringify(plain);

    expect(wildcardJson).toContain('"contains":"FI-"');
    expect(wildcardJson).toContain('"contains":"alp"');
    expect(plainJson).toContain('"startsWith":"FI-"');
    expect(plainJson).toContain('"contains":"Alpha"');
  });

  it("skips wildcard probe filters when probe is empty", () => {
    const where = buildWhere({ ek: "", reg: "%%", name: "__" });
    expect(where).toEqual({});
  });

  it("adds sex, year range and ekOnly constraints", () => {
    const male = buildWhere({
      ek: "",
      reg: "",
      name: "",
      sex: "male",
      birthYearFrom: 2020,
      birthYearTo: 2021,
      ekOnly: true,
    });
    const female = buildWhere({ ek: "", reg: "", name: "", sex: "female" });

    const maleJson = JSON.stringify(male);
    const femaleJson = JSON.stringify(female);

    expect(maleJson).toContain(DogSex.MALE);
    expect(maleJson).toContain('"gte":"2020-01-01T00:00:00.000Z"');
    expect(maleJson).toContain('"lte":"2021-12-31T23:59:59.999Z"');
    expect(maleJson).toContain('"not":null');
    expect(femaleJson).toContain(DogSex.FEMALE);
  });
});
