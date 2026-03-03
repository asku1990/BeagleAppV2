import { DogSex } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { sortRows } from "../sorting";

function row(input: {
  id: string;
  name: string;
  registrationNo: string;
  createdAt: string;
  ekNo?: number | null;
  birthDate?: string | null;
}) {
  return {
    id: input.id,
    ekNo: input.ekNo ?? null,
    createdAt: new Date(input.createdAt),
    name: input.name,
    sex: DogSex.MALE,
    birthDate: input.birthDate ? new Date(input.birthDate) : null,
    registrationNos: [input.registrationNo],
    primaryRegistrationNo: input.registrationNo,
    sire: "-",
    dam: "-",
    trialCount: 0,
    showCount: 0,
  };
}

describe("dogs/search/internal/sorting", () => {
  it("sorts by created date desc and id desc on tie", () => {
    const rows = sortRows(
      [
        row({
          id: "a",
          name: "A",
          registrationNo: "FI-1/24",
          createdAt: "2026-01-01",
        }),
        row({
          id: "b",
          name: "B",
          registrationNo: "FI-2/24",
          createdAt: "2026-01-01",
        }),
      ],
      "created-desc",
    );

    expect(rows.map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("sorts by registration desc using parsed values", () => {
    const rows = sortRows(
      [
        row({
          id: "a",
          name: "A",
          registrationNo: "FI-10/24",
          createdAt: "2026-01-01",
        }),
        row({
          id: "b",
          name: "B",
          registrationNo: "FI-11/25",
          createdAt: "2026-01-01",
        }),
      ],
      "reg-desc",
    );

    expect(rows.map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("sorts by birth date desc and places null birth dates last", () => {
    const rows = sortRows(
      [
        row({
          id: "a",
          name: "A",
          registrationNo: "FI-1/24",
          createdAt: "2026-01-01",
          birthDate: "2024-01-01",
        }),
        row({
          id: "b",
          name: "B",
          registrationNo: "FI-2/24",
          createdAt: "2026-01-01",
          birthDate: null,
        }),
        row({
          id: "c",
          name: "C",
          registrationNo: "FI-3/24",
          createdAt: "2026-01-01",
          birthDate: "2023-01-01",
        }),
      ],
      "birth-desc",
    );

    expect(rows.map((item) => item.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts by ek asc with nulls last and id tie-break", () => {
    const rows = sortRows(
      [
        row({
          id: "c",
          name: "C",
          registrationNo: "FI-3/24",
          createdAt: "2026-01-01",
          ekNo: null,
        }),
        row({
          id: "b",
          name: "B",
          registrationNo: "FI-2/24",
          createdAt: "2026-01-01",
          ekNo: 1,
        }),
        row({
          id: "a",
          name: "A",
          registrationNo: "FI-1/24",
          createdAt: "2026-01-01",
          ekNo: 1,
        }),
      ],
      "ek-asc",
    );

    expect(rows.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("defaults to name asc with registration tie-break", () => {
    const rows = sortRows(
      [
        row({
          id: "x",
          name: "Alpha",
          registrationNo: "FI-9/24",
          createdAt: "2026-01-01",
        }),
        row({
          id: "y",
          name: "Alpha",
          registrationNo: "FI-8/24",
          createdAt: "2026-01-01",
        }),
        row({
          id: "z",
          name: "Beta",
          registrationNo: "FI-7/24",
          createdAt: "2026-01-01",
        }),
      ],
      "name-asc",
    );

    expect(rows.map((item) => item.id)).toEqual(["y", "x", "z"]);
  });
});
