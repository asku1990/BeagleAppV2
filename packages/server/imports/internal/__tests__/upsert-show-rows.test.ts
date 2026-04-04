import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LegacyShowResultRow } from "@beagle/db";
import { upsertShowRows } from "../upsert-show-rows";

const {
  showResultDefinitionFindManyMock,
  showEventUpsertMock,
  showEntryUpsertMock,
  showResultItemUpsertMock,
} = vi.hoisted(() => ({
  showResultDefinitionFindManyMock: vi.fn(),
  showEventUpsertMock: vi.fn(),
  showEntryUpsertMock: vi.fn(),
  showResultItemUpsertMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  prisma: {
    showResultDefinition: { findMany: showResultDefinitionFindManyMock },
    showEvent: { upsert: showEventUpsertMock },
    showEntry: { upsert: showEntryUpsertMock },
    showResultItem: { upsert: showResultItemUpsertMock },
  },
}));

describe("upsertShowRows", () => {
  beforeEach(() => {
    showResultDefinitionFindManyMock.mockReset();
    showEventUpsertMock.mockReset();
    showEntryUpsertMock.mockReset();
    showResultItemUpsertMock.mockReset();

    showResultDefinitionFindManyMock.mockResolvedValue([]);
    showEventUpsertMock.mockResolvedValue({ id: "event-1" });
    showEntryUpsertMock.mockResolvedValue({ id: "entry-1" });
    showResultItemUpsertMock.mockResolvedValue({ id: "item-1" });
  });

  it("does not overwrite event-level provenance on update", async () => {
    const rows: LegacyShowResultRow[] = [
      {
        registrationNo: "FI-1/20",
        eventDateRaw: "20240101",
        eventPlace: "Helsinki",
        resultText: null,
        critiqueText: null,
        dogName: "Dog One",
        heightText: null,
        judge: null,
        legacyFlag: null,
        sourceTable: "nay9599",
      },
    ];
    const dogIdByRegistration = new Map<string, string>([["FI-1/20", "dog-1"]]);

    const result = await upsertShowRows(rows, dogIdByRegistration, {
      importRunId: "run-1",
    });

    expect(result.upserted).toBe(1);
    expect(result.errors).toBe(0);
    expect(showEventUpsertMock).toHaveBeenCalledTimes(1);

    const upsertArg = showEventUpsertMock.mock.calls[0]?.[0];
    expect(upsertArg?.update).toBeDefined();
    expect(upsertArg?.update).not.toHaveProperty("sourceTag");
    expect(upsertArg?.update).not.toHaveProperty("sourceTable");
    expect(upsertArg?.update).not.toHaveProperty("sourceRef");
    expect(upsertArg?.update).not.toHaveProperty("rawPayloadJson");
    expect(upsertArg?.create).toHaveProperty("sourceTag");
    expect(upsertArg?.create).toHaveProperty("sourceTable");
    expect(upsertArg?.create).toHaveProperty("sourceRef");
    expect(upsertArg?.create).toHaveProperty("rawPayloadJson");
  });

  it("matches parsed items against canonical enabled definition rows", async () => {
    showResultDefinitionFindManyMock.mockResolvedValue([
      { id: "def-nord-vara", code: "NORD-varaSERT" },
      { id: "def-laatu-numero", code: "LEGACY-LAATUARVOSTELU" },
      { id: "def-jun", code: "JUN" },
    ]);

    const rows: LegacyShowResultRow[] = [
      {
        registrationNo: "FI-1/20",
        eventDateRaw: "20020101",
        eventPlace: "Helsinki",
        resultText: "NORDVARASERT JUN1",
        critiqueText: null,
        dogName: "Dog One",
        heightText: null,
        judge: null,
        legacyFlag: null,
        sourceTable: "nay9599",
      },
    ];
    const dogIdByRegistration = new Map<string, string>([["FI-1/20", "dog-1"]]);

    const result = await upsertShowRows(rows, dogIdByRegistration, {
      importRunId: "run-1",
    });

    expect(result.upserted).toBe(1);
    expect(result.errors).toBe(0);
    expect(result.issues).toEqual([]);
    expect(showResultItemUpsertMock).toHaveBeenCalledTimes(3);

    const definitionIds = showResultItemUpsertMock.mock.calls.map(
      (call) => call[0]?.create?.definitionId,
    );
    expect(definitionIds).toEqual(
      expect.arrayContaining(["def-nord-vara", "def-laatu-numero", "def-jun"]),
    );
  });

  it("writes an info issue note when a class+digit result is normalized after the 2003 cutoff", async () => {
    showResultDefinitionFindManyMock.mockResolvedValue([
      { id: "def-eri", code: "ERI" },
      { id: "def-jun", code: "JUN" },
    ]);

    const rows: LegacyShowResultRow[] = [
      {
        registrationNo: "FI-1/20",
        eventDateRaw: "20030101",
        eventPlace: "Helsinki",
        resultText: "JUN1",
        critiqueText: null,
        dogName: "Dog One",
        heightText: null,
        judge: null,
        legacyFlag: null,
        sourceTable: "nay9599",
      },
    ];
    const dogIdByRegistration = new Map<string, string>([["FI-1/20", "dog-1"]]);

    const result = await upsertShowRows(rows, dogIdByRegistration, {
      importRunId: "run-1",
    });

    expect(result.upserted).toBe(1);
    expect(result.errors).toBe(0);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "INFO",
          code: "SHOW_RESULT_LAATUARVOSTELU_FORMAT_CHANGED",
        }),
      ]),
    );
    expect(showResultItemUpsertMock).toHaveBeenCalledTimes(2);
  });

  it("writes legacy numeric quality item fields compatible with admin manual updates", async () => {
    showResultDefinitionFindManyMock.mockResolvedValue([
      { id: "def-legacy-quality", code: "LEGACY-LAATUARVOSTELU" },
      { id: "def-avo", code: "AVO" },
    ]);

    const rows: LegacyShowResultRow[] = [
      {
        registrationNo: "FI-1/20",
        eventDateRaw: "20020101",
        eventPlace: "Helsinki",
        resultText: "AVO4",
        critiqueText: null,
        dogName: "Dog One",
        heightText: null,
        judge: null,
        legacyFlag: null,
        sourceTable: "nay9599",
      },
    ];
    const dogIdByRegistration = new Map<string, string>([["FI-1/20", "dog-1"]]);

    const result = await upsertShowRows(rows, dogIdByRegistration, {
      importRunId: "run-1",
    });

    expect(result.upserted).toBe(1);
    expect(result.errors).toBe(0);

    const legacyQualityCreate = showResultItemUpsertMock.mock.calls
      .map((call) => call[0]?.create)
      .find((create) => create?.definitionId === "def-legacy-quality");

    expect(legacyQualityCreate).toEqual(
      expect.objectContaining({
        definitionId: "def-legacy-quality",
        valueCode: null,
        valueNumeric: 4,
        isAwarded: null,
      }),
    );
  });
});
