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
});
