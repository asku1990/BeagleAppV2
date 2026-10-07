import type { DogImportStateDb } from "@beagle/db";
import { describe, expect, it } from "vitest";
import { evaluateDogImportRows } from "../evaluate-dog-import-rows";
import type { CanonicalDogImportRow } from "@server/admin/dogs/import/internal/model/canonical-dog-import";

const state: DogImportStateDb = {
  dogs: [],
  colors: [],
  historicalLinksByRegistration: {},
};
const row: CanonicalDogImportRow = {
  source: "FINNISH_KENNEL_CLUB",
  sourceRowNumber: 2,
  registrationNo: "FI123/24",
  name: "Beagle",
  sex: "FEMALE",
  birthDate: "2024-01-01",
  registeredOn: "2024-01-02",
  breederNameText: null,
  originTypeText: "Suomi",
  originCountryText: null,
  colorName: null,
  tailText: null,
  sireRegistrationNo: "FI1/20",
  damRegistrationNo: "FI2/20",
};

describe("evaluateDogImportRows parser facts", () => {
  it("blocks rows for parser blockers and includes the adapted issue", () => {
    const evaluation = evaluateDogImportRows([row], state, [
      {
        code: "BREED_NOT_BEAGLE",
        header: "Rotukoodi",
        columnIndex: 3,
        sourceRowNumber: 2,
      },
    ]);

    expect(evaluation.applyAllowed).toBe(false);
    expect(evaluation.rows[0]).toMatchObject({
      status: "BLOCKED",
      issues: [{ code: "BREED_NOT_BEAGLE", field: null }],
    });
  });

  it("plans parent links when an existing dog has different parents", () => {
    const updatedAt = new Date("2026-01-01T00:00:00.000Z");
    const registrationUpdatedAt = new Date("2026-01-01T00:00:00.000Z");
    const evaluation = evaluateDogImportRows([row], {
      colors: [],
      historicalLinksByRegistration: {},
      dogs: [
        {
          id: "dog-1",
          registrationNo: row.registrationNo!,
          name: row.name!,
          sex: row.sex!,
          status: "NORMAL",
          birthDate: new Date("2024-01-01T00:00:00.000Z"),
          sireId: null,
          damId: null,
          breederNameText: null,
          breederId: null,
          breederName: null,
          colorCode: null,
          originTypeText: row.originTypeText,
          originCountryText: row.originCountryText,
          tailText: row.tailText,
          updatedAt,
          registrationId: "registration-1",
          registeredOn: new Date("2024-01-02T00:00:00.000Z"),
          registrationUpdatedAt,
        },
        {
          id: "sire-1",
          registrationNo: row.sireRegistrationNo!,
          name: "Sire",
          sex: "MALE",
          status: "NORMAL",
          birthDate: null,
          sireId: null,
          damId: null,
          breederNameText: null,
          breederId: null,
          breederName: null,
          colorCode: null,
          originTypeText: null,
          originCountryText: null,
          tailText: null,
          updatedAt,
          registrationId: "registration-sire",
          registeredOn: null,
          registrationUpdatedAt,
        },
        {
          id: "dam-1",
          registrationNo: row.damRegistrationNo!,
          name: "Dam",
          sex: "FEMALE",
          status: "NORMAL",
          birthDate: null,
          sireId: null,
          damId: null,
          breederNameText: null,
          breederId: null,
          breederName: null,
          colorCode: null,
          originTypeText: null,
          originCountryText: null,
          tailText: null,
          updatedAt,
          registrationId: "registration-dam",
          registeredOn: null,
          registrationUpdatedAt,
        },
      ],
    });

    expect(evaluation.plan.updates).toHaveLength(1);
    expect(evaluation.plan.updates[0]).toMatchObject({
      id: "dog-1",
      sireRegistrationNo: row.sireRegistrationNo,
      damRegistrationNo: row.damRegistrationNo,
    });
  });

  it("builds the same digest when parser facts arrive in another order", () => {
    const facts = [
      {
        code: "INVALID_DATE" as const,
        header: "Rekisteröity",
        columnIndex: 6,
        sourceRowNumber: 2,
      },
      {
        code: "BREED_NOT_BEAGLE" as const,
        header: "Rotukoodi",
        columnIndex: 3,
        sourceRowNumber: 2,
      },
    ];

    expect(evaluateDogImportRows([row], state, facts).previewDigest).toBe(
      evaluateDogImportRows([row], state, [...facts].reverse()).previewDigest,
    );
  });

  it("does not report a color difference when both labels resolve to the same color", () => {
    const updatedAt = new Date("2026-01-01T00:00:00.000Z");
    const evaluation = evaluateDogImportRows(
      [{ ...row, colorName: "kolmivärinen" }],
      {
        historicalLinksByRegistration: {},
        colors: [
          {
            code: 121,
            nameFi: "Kolmivärinen",
            status: "SELECTABLE",
            updatedAt,
          },
        ],
        dogs: [
          {
            id: "dog-1",
            registrationNo: row.registrationNo!,
            name: row.name!,
            sex: row.sex!,
            status: "NORMAL",
            birthDate: new Date("2024-01-01T00:00:00.000Z"),
            sireId: null,
            damId: null,
            breederNameText: null,
            breederId: null,
            breederName: null,
            colorCode: 121,
            originTypeText: row.originTypeText,
            originCountryText: row.originCountryText,
            tailText: row.tailText,
            updatedAt,
            registrationId: "registration-1",
            registeredOn: new Date("2024-01-02T00:00:00.000Z"),
            registrationUpdatedAt: updatedAt,
          },
        ],
      },
    );

    expect(evaluation.issues).not.toContainEqual(
      expect.objectContaining({ code: "DOG_COLOR_DIFFERS" }),
    );
  });
});
