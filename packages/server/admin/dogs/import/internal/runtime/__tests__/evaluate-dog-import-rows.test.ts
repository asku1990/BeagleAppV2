import type { DogImportStateDb } from "@beagle/db";
import { describe, expect, it } from "vitest";
import { evaluateDogImportRows } from "../evaluate-dog-import-rows";
import type { CanonicalDogImportRow } from "@server/admin/dogs/import/internal/model/canonical-dog-import";

const state: DogImportStateDb = {
  breedersByKennel: new Map(),
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
  kennel: null,
  originTypeText: "Suomi",
  originCountryText: null,
  colorName: null,
  tailText: null,
  sireRegistrationNo: "FI1/20",
  damRegistrationNo: "FI2/20",
};

describe("evaluateDogImportRows parser facts", () => {
  it("detects a historical registration edit even when the planned entry IDs are unchanged", () => {
    const currentState: DogImportStateDb = {
      ...state,
      historicalLinksByRegistration: {
        "FI123/24": {
          showEntries: [{ id: "show-1", registrationNo: "fi123/24" }],
          trialEntries: [],
        },
      },
    };
    const reviewed = evaluateDogImportRows([row], currentState);
    const edited = evaluateDogImportRows([row], {
      ...currentState,
      historicalLinksByRegistration: {
        "FI123/24": {
          showEntries: [{ id: "show-1", registrationNo: "FI123/24" }],
          trialEntries: [],
        },
      },
    });

    expect(reviewed.plan.historicalLinks).toEqual([
      {
        registrationNo: "FI123/24",
        showEntryIds: ["show-1"],
        trialEntryIds: [],
      },
    ]);
    expect(edited.plan).toEqual(reviewed.plan);
    expect(edited.previewDigest).not.toBe(reviewed.previewDigest);
  });

  it("blocks rows for parser blockers and includes the adapted issue", () => {
    const evaluation = evaluateDogImportRows([row], state, [
      {
        code: "BREED_NOT_BEAGLE",
        header: "Rotukoodi",
        columnIndex: 3,
        sourceRowNumber: 2,
      },
    ]);

    expect(evaluation.hasBlockers).toBe(true);
    expect(evaluation.rows[0]).toMatchObject({
      status: "BLOCKED",
      issues: [{ code: "BREED_NOT_BEAGLE", field: null }],
    });
  });

  it("blocks a row with an invalid birth date and identifies the affected field", () => {
    const evaluation = evaluateDogImportRows(
      [{ ...row, birthDate: null }],
      state,
      [
        {
          code: "INVALID_DATE",
          header: "Syntymäaika",
          columnIndex: 5,
          sourceRowNumber: row.sourceRowNumber,
        },
      ],
    );

    expect(evaluation.hasBlockers).toBe(true);
    expect(evaluation.rows[0]).toMatchObject({
      sourceRowNumber: row.sourceRowNumber,
      status: "BLOCKED",
      issues: [
        {
          code: "DOG_BIRTH_DATE_INVALID",
          field: "birthDate",
          severity: "BLOCKER",
        },
      ],
    });
    expect(evaluation.plan.creates).toHaveLength(0);
  });

  it("plans missing parent links and reports no changes once they exist", () => {
    const updatedAt = new Date("2026-01-01T00:00:00.000Z");
    const registrationUpdatedAt = new Date("2026-01-01T00:00:00.000Z");
    const currentState: DogImportStateDb = {
      ...state,
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
    };
    const evaluation = evaluateDogImportRows([row], currentState);
    const reassigned = evaluateDogImportRows([row], {
      ...currentState,
      dogs: currentState.dogs.map((dog) =>
        dog.id === "sire-1" ? { ...dog, id: "sire-2" } : dog,
      ),
    });
    expect(reassigned.plan).toEqual(evaluation.plan);
    expect(reassigned.previewDigest).not.toBe(evaluation.previewDigest);

    expect(evaluation.hasChanges).toBe(true);
    expect(evaluation.plan.updates).toHaveLength(1);
    expect(evaluation.rows[0]?.changes).toEqual([
      {
        field: "sireRegistrationNo",
        before: null,
        after: row.sireRegistrationNo,
      },
      {
        field: "damRegistrationNo",
        before: null,
        after: row.damRegistrationNo,
      },
    ]);
    expect(evaluation.plan.updates[0]).toMatchObject({
      id: "dog-1",
      sireRegistrationNo: row.sireRegistrationNo,
      damRegistrationNo: row.damRegistrationNo,
    });

    const linkedState = {
      ...currentState,
      dogs: currentState.dogs.map((dog) =>
        dog.id === "dog-1" ? { ...dog, sireId: "sire-1", damId: "dam-1" } : dog,
      ),
    };
    expect(evaluateDogImportRows([row], linkedState)).toMatchObject({
      hasBlockers: false,
      hasChanges: false,
      unchangedCount: 1,
    });

    const sireAlias = {
      ...linkedState.dogs.find(({ id }) => id === "sire-1")!,
      registrationId: "registration-sire-alias",
      registrationNo: "SE1/20",
    };
    const damAlias = {
      ...linkedState.dogs.find(({ id }) => id === "dam-1")!,
      registrationId: "registration-dam-alias",
      registrationNo: "SE2/20",
    };
    const aliasRow = {
      ...row,
      sireRegistrationNo: sireAlias.registrationNo,
      damRegistrationNo: damAlias.registrationNo,
    };
    expect(
      evaluateDogImportRows([aliasRow], {
        ...linkedState,
        dogs: [...linkedState.dogs, sireAlias, damAlias],
      }),
    ).toMatchObject({
      hasBlockers: false,
      hasChanges: false,
      unchangedCount: 1,
    });

    const differentParents = evaluateDogImportRows([aliasRow], {
      ...linkedState,
      dogs: [
        ...linkedState.dogs,
        { ...sireAlias, id: "sire-2" },
        { ...damAlias, id: "dam-2" },
      ],
    });
    expect(differentParents).toMatchObject({
      hasBlockers: true,
      rows: [
        {
          status: "BLOCKED",
          issues: expect.arrayContaining([
            expect.objectContaining({ code: "DOG_SIRE_CONFLICT" }),
            expect.objectContaining({ code: "DOG_DAM_CONFLICT" }),
          ]),
        },
      ],
      plan: { updates: [] },
    });

    const kennelRow = { ...row, kennel: "TAVAJS" };
    const breeder = { id: "breeder-1", name: "TAVAJS" };
    const breederState = {
      ...linkedState,
      breedersByKennel: new Map([["TAVAJS", [breeder]]]),
    };
    const withBreeder = evaluateDogImportRows([kennelRow], breederState);
    expect(withBreeder.rows[0]).toMatchObject({
      status: "UPDATE",
      breederToLink: "TAVAJS",
      issues: [],
    });
    expect(withBreeder.plan.updates[0]?.data).toEqual({
      breederId: breeder.id,
    });

    const linkedBreederState = {
      ...breederState,
      dogs: linkedState.dogs.map((dog) =>
        dog.id === "dog-1"
          ? { ...dog, breederId: breeder.id, breederName: breeder.name }
          : dog,
      ),
    };
    expect(
      evaluateDogImportRows([kennelRow], linkedBreederState).hasChanges,
    ).toBe(false);
    expect(evaluateDogImportRows([row], linkedBreederState).hasChanges).toBe(
      false,
    );
    const conflictingState = {
      ...linkedBreederState,
      breedersByKennel: new Map([
        ["TAVAJS", [{ id: "breeder-2", name: "Tavajs" }]],
      ]),
    };
    expect(
      evaluateDogImportRows([kennelRow], conflictingState).rows[0],
    ).toMatchObject({
      status: "BLOCKED",
      issues: [{ code: "DOG_BREEDER_LINK_CONFLICT" }],
    });
  });

  it("promotes a fallback name but blocks two registrations for the same dog", () => {
    const reference: DogImportStateDb["dogs"][number] = {
      id: "reference",
      registrationId: "registration",
      registrationNo: row.registrationNo!,
      name: row.registrationNo!,
      status: "REFERENCE_ONLY",
      sex: "UNKNOWN",
      birthDate: null,
      registeredOn: null,
      sireId: null,
      damId: null,
      breederId: null,
      breederName: null,
      colorCode: null,
      originTypeText: null,
      originCountryText: null,
      tailText: null,
      updatedAt: new Date(0),
      registrationUpdatedAt: new Date(0),
    };
    const promoted = evaluateDogImportRows([row], {
      ...state,
      dogs: [reference],
    });
    expect(promoted.hasBlockers).toBe(false);
    expect(promoted.plan.updates[0]?.data).toMatchObject({
      status: "NORMAL",
      name: row.name,
    });
    const alias = {
      ...reference,
      registrationId: "alias",
      registrationNo: "FI999/24",
    };
    const collisions = evaluateDogImportRows(
      [
        row,
        { ...row, sourceRowNumber: 3, registrationNo: alias.registrationNo },
      ],
      { ...state, dogs: [reference, alias] },
    );
    expect(collisions.blockedCount).toBe(2);
    expect(collisions.plan.updates).toHaveLength(0);
  });

  it("requires a unique breeder for a nonblank kennel on a new dog", () => {
    const kennelRow = { ...row, kennel: "TAVAJS" };
    const breeder = { id: "breeder-1", name: "Tavajs" };
    const evaluate = (matches: (typeof breeder)[]) =>
      evaluateDogImportRows([kennelRow], {
        ...state,
        breedersByKennel: new Map([["TAVAJS", matches]]),
      });
    expect(evaluate([]).rows[0]).toMatchObject({
      status: "BLOCKED",
      issues: [{ code: "DOG_BREEDER_NOT_FOUND" }],
    });
    expect(
      evaluate([breeder, { id: "breeder-2", name: "TAVAJS" }]).rows[0],
    ).toMatchObject({
      status: "BLOCKED",
      issues: [{ code: "DOG_BREEDER_AMBIGUOUS" }],
    });
    expect(evaluate([breeder]).plan.creates[0]).toMatchObject({
      breederId: breeder.id,
    });
  });

  it("builds the same digest when parser facts arrive in another order", () => {
    const facts = [
      {
        ...state,
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

  it("shows recognized color changes as updates and warns only for unresolved colors", () => {
    const updatedAt = new Date("2026-01-01T00:00:00.000Z");
    const colorState: DogImportStateDb = {
      ...state,
      historicalLinksByRegistration: {},
      colors: [
        { code: 122, nameFi: "Kaksivärinen", status: "SELECTABLE", updatedAt },
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
    };
    const preview = (colorName: string) =>
      evaluateDogImportRows([{ ...row, colorName }], colorState);
    expect(preview("kolmivärinen").rows[0]?.changes).not.toContainEqual(
      expect.objectContaining({ field: "colorName" }),
    );
    const changed = preview("kaksivärinen");
    expect(changed.rows[0]?.changes).toContainEqual({
      field: "colorName",
      before: "Kolmivärinen",
      after: "Kaksivärinen",
    });
    expect(changed.plan.updates[0]?.data.colorCode).toBe(122);
    expect(changed.issues.some((issue) => issue.severity === "WARNING")).toBe(
      false,
    );
    const unresolved = preview("unknown");
    expect(unresolved.issues).toContainEqual(
      expect.objectContaining({
        code: "DOG_COLOR_UNRESOLVED",
        severity: "WARNING",
      }),
    );
    expect(unresolved.plan.updates[0]?.data).not.toHaveProperty("colorCode");
  });
});
