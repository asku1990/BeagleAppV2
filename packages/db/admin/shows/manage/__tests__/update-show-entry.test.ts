import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminShowEntryWriteDb } from "../update-show-entry";

const {
  prismaTransactionMock,
  showEventFindFirstMock,
  showEventFindManyMock,
  showEntryFindFirstMock,
  showEntryUpdateMock,
  showResultDefinitionFindManyMock,
  showResultItemDeleteManyMock,
  showResultItemCreateManyMock,
} = vi.hoisted(() => {
  const showEventFindFirst = vi.fn();
  const showEventFindMany = vi.fn();
  const showEntryFindFirst = vi.fn();
  const showEntryUpdate = vi.fn();
  const showResultDefinitionFindMany = vi.fn();
  const showResultItemDeleteMany = vi.fn();
  const showResultItemCreateMany = vi.fn();

  const tx = {
    showEvent: {
      findFirst: showEventFindFirst,
      findMany: showEventFindMany,
    },
    showEntry: {
      findFirst: showEntryFindFirst,
      update: showEntryUpdate,
    },
    showResultDefinition: {
      findMany: showResultDefinitionFindMany,
    },
    showResultItem: {
      deleteMany: showResultItemDeleteMany,
      createMany: showResultItemCreateMany,
    },
  };

  return {
    prismaTransactionMock: vi.fn(async (callback) => callback(tx)),
    showEventFindFirstMock: showEventFindFirst,
    showEventFindManyMock: showEventFindMany,
    showEntryFindFirstMock: showEntryFindFirst,
    showEntryUpdateMock: showEntryUpdate,
    showResultDefinitionFindManyMock: showResultDefinitionFindMany,
    showResultItemDeleteManyMock: showResultItemDeleteMany,
    showResultItemCreateManyMock: showResultItemCreateMany,
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: {
    $transaction: prismaTransactionMock,
  },
}));

describe("updateAdminShowEntryWriteDb", () => {
  beforeEach(() => {
    prismaTransactionMock.mockClear();
    showEventFindFirstMock.mockReset();
    showEventFindManyMock.mockReset();
    showEntryFindFirstMock.mockReset();
    showEntryUpdateMock.mockReset();
    showResultDefinitionFindManyMock.mockReset();
    showResultItemDeleteManyMock.mockReset();
    showResultItemCreateManyMock.mockReset();
  });

  it("returns not_found when event is missing", async () => {
    showEventFindFirstMock.mockResolvedValue(null);

    await expect(
      updateAdminShowEntryWriteDb({
        eventKey: "missing",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        entryId: "entry-1",
        judge: null,
        critiqueText: null,
        heightText: null,
        classCode: null,
        qualityGrade: null,
        classPlacement: null,
        pupn: null,
        awards: [],
      }),
    ).resolves.toEqual({ status: "not_found" });
  });

  it("returns not_found when entry is not in selected event", async () => {
    showEventFindFirstMock.mockResolvedValue({ id: "event-1" });
    showEntryFindFirstMock.mockResolvedValue(null);

    await expect(
      updateAdminShowEntryWriteDb({
        eventKey: "2025-06-01|HELSINKI",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        entryId: "entry-1",
        judge: null,
        critiqueText: null,
        heightText: null,
        classCode: null,
        qualityGrade: null,
        classPlacement: null,
        pupn: null,
        awards: [],
      }),
    ).resolves.toEqual({ status: "not_found" });
  });

  it("returns invalid_class_code for unknown class", async () => {
    showEventFindFirstMock.mockResolvedValue({ id: "event-1" });
    showEntryFindFirstMock.mockResolvedValue({
      id: "entry-1",
      entryLookupKey: "FI123/21|2025-06-01|HELSINKI",
    });
    showResultDefinitionFindManyMock.mockResolvedValue([
      {
        id: "def-quality-eri",
        code: "ERI",
        isVisibleByDefault: true,
        category: { code: "LAATUARVOSTELU" },
      },
    ]);

    await expect(
      updateAdminShowEntryWriteDb({
        eventKey: "2025-06-01|HELSINKI",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        entryId: "entry-1",
        judge: "Judge",
        critiqueText: "Good",
        heightText: "38",
        classCode: "AVO",
        qualityGrade: null,
        classPlacement: null,
        pupn: null,
        awards: [],
      }),
    ).resolves.toEqual({ status: "invalid_class_code" });
  });

  it("updates entry fields and replaces editable result items", async () => {
    showEventFindFirstMock.mockResolvedValue({ id: "event-1" });
    showEntryFindFirstMock.mockResolvedValue({
      id: "entry-1",
      entryLookupKey: "FI123/21|2025-06-01|HELSINKI",
    });
    showResultDefinitionFindManyMock.mockResolvedValue([
      {
        id: "def-class-avo",
        code: "AVO",
        isVisibleByDefault: true,
        category: { code: "KILPAILULUOKKA" },
      },
      {
        id: "def-quality-eri",
        code: "ERI",
        isVisibleByDefault: true,
        category: { code: "LAATUARVOSTELU" },
      },
      {
        id: "def-placement",
        code: "SIJOITUS",
        isVisibleByDefault: true,
        category: { code: "SIJOITUS" },
      },
      {
        id: "def-pupn",
        code: "PUPN",
        isVisibleByDefault: true,
        category: { code: "PUPN" },
      },
      {
        id: "def-award-sert",
        code: "SERT",
        isVisibleByDefault: true,
        category: { code: "ERIKOISMAININTA" },
      },
      {
        id: "def-legacy-quality",
        code: "LEGACY-LAATUARVOSTELU",
        isVisibleByDefault: true,
        category: { code: "LAATUARVOSTELU" },
      },
      {
        id: "def-hidden",
        code: "HIDDEN",
        isVisibleByDefault: false,
        category: { code: "ERIKOISMAININTA" },
      },
    ]);

    const result = await updateAdminShowEntryWriteDb({
      eventKey: "2025-06-01|HELSINKI",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      entryId: "entry-1",
      judge: "Judge A",
      critiqueText: "Balanced",
      heightText: "38",
      classCode: "AVO",
      qualityGrade: "ERI",
      classPlacement: 2,
      pupn: "PU2",
      awards: ["SERT"],
    });

    expect(result).toEqual({
      status: "updated",
      entryId: "entry-1",
    });
    expect(showEntryUpdateMock).toHaveBeenCalledWith({
      where: { id: "entry-1" },
      data: {
        judge: "Judge A",
        critiqueText: "Balanced",
        heightText: "38",
      },
    });
    expect(showResultItemDeleteManyMock).toHaveBeenCalledWith({
      where: {
        showEntryId: "entry-1",
        definitionId: {
          in: expect.arrayContaining([
            "def-class-avo",
            "def-quality-eri",
            "def-placement",
            "def-pupn",
            "def-award-sert",
            "def-legacy-quality",
          ]),
        },
      },
    });
    expect(showResultItemCreateManyMock).toHaveBeenCalledTimes(1);
    expect(showResultItemCreateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            definitionId: "def-class-avo",
            itemLookupKey: "FI123/21|2025-06-01|HELSINKI|AVO|VALUE|1",
            valueCode: null,
            valueNumeric: null,
            isAwarded: null,
          }),
          expect.objectContaining({
            definitionId: "def-quality-eri",
            itemLookupKey: "FI123/21|2025-06-01|HELSINKI|ERI|VALUE|1",
            valueCode: null,
            valueNumeric: null,
            isAwarded: null,
          }),
          expect.objectContaining({
            definitionId: "def-placement",
            itemLookupKey: "FI123/21|2025-06-01|HELSINKI|SIJOITUS|2|1",
            valueCode: null,
            valueNumeric: 2,
            isAwarded: null,
          }),
          expect.objectContaining({
            definitionId: "def-pupn",
            itemLookupKey: "FI123/21|2025-06-01|HELSINKI|PUPN|PU2|1",
            valueCode: "PU2",
            valueNumeric: null,
            isAwarded: null,
          }),
          expect.objectContaining({
            definitionId: "def-award-sert",
            itemLookupKey: "FI123/21|2025-06-01|HELSINKI|SERT|FLAG|1",
            valueCode: null,
            valueNumeric: null,
            isAwarded: true,
          }),
        ]),
      }),
    );
  });

  it("returns not_found when date/place fallback matches multiple events", async () => {
    showEventFindManyMock.mockResolvedValue([
      { id: "event-1" },
      { id: "event-2" },
    ]);

    await expect(
      updateAdminShowEntryWriteDb({
        eventKey: null,
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        entryId: "entry-1",
        judge: null,
        critiqueText: null,
        heightText: null,
        classCode: null,
        qualityGrade: null,
        classPlacement: null,
        pupn: null,
        awards: [],
      }),
    ).resolves.toEqual({ status: "not_found" });
  });

  it("maps numeric quality to legacy quality definition item", async () => {
    showEventFindFirstMock.mockResolvedValue({ id: "event-1" });
    showEntryFindFirstMock.mockResolvedValue({
      id: "entry-1",
      entryLookupKey: "FI123/21|2025-06-01|HELSINKI",
    });
    showResultDefinitionFindManyMock.mockResolvedValue([
      {
        id: "def-legacy-quality",
        code: "LEGACY-LAATUARVOSTELU",
        isVisibleByDefault: true,
        category: { code: "LAATUARVOSTELU" },
      },
    ]);

    const result = await updateAdminShowEntryWriteDb({
      eventKey: "2025-06-01|HELSINKI",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      entryId: "entry-1",
      judge: null,
      critiqueText: null,
      heightText: null,
      classCode: null,
      qualityGrade: "4",
      classPlacement: null,
      pupn: null,
      awards: [],
    });

    expect(result).toEqual({
      status: "updated",
      entryId: "entry-1",
    });
    expect(showResultItemCreateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            definitionId: "def-legacy-quality",
            itemLookupKey:
              "FI123/21|2025-06-01|HELSINKI|LEGACY-LAATUARVOSTELU|4|1",
            valueCode: null,
            valueNumeric: 4,
            isAwarded: null,
          }),
        ],
      }),
    );
  });
});
