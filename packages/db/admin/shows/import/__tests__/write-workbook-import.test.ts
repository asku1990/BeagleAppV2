import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  showEventFindManyMock,
  showEventCreateManyMock,
  dogRegistrationFindManyMock,
  showResultDefinitionFindManyMock,
  showEntryCreateManyMock,
  showResultItemCreateManyMock,
  prismaTransactionMock,
  prismaMock,
} = vi.hoisted(() => {
  const showEventFindMany = vi.fn();
  const showEventCreateMany = vi.fn();
  const dogRegistrationFindMany = vi.fn();
  const showResultDefinitionFindMany = vi.fn();
  const showEntryCreateMany = vi.fn();
  const showResultItemCreateMany = vi.fn();
  const prismaTransaction = vi.fn();

  return {
    showEventFindManyMock: showEventFindMany,
    showEventCreateManyMock: showEventCreateMany,
    dogRegistrationFindManyMock: dogRegistrationFindMany,
    showResultDefinitionFindManyMock: showResultDefinitionFindMany,
    showEntryCreateManyMock: showEntryCreateMany,
    showResultItemCreateManyMock: showResultItemCreateMany,
    prismaTransactionMock: prismaTransaction,
    prismaMock: {
      $transaction: prismaTransaction,
    },
  };
});

vi.mock("node:crypto", () => ({
  randomUUID: vi.fn(() => "uuid-fixed"),
}));

vi.mock("@db/core/prisma", () => ({
  prisma: prismaMock,
}));

import {
  WORKBOOK_IMPORT_WRITE_TX_CONFIG,
  writeAdminShowWorkbookImportDb,
} from "../write-workbook-import";

describe("writeAdminShowWorkbookImportDb", () => {
  beforeEach(() => {
    showEventFindManyMock.mockReset();
    showEventCreateManyMock.mockReset();
    dogRegistrationFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockReset();
    showEntryCreateManyMock.mockReset();
    showResultItemCreateManyMock.mockReset();
    prismaTransactionMock.mockReset();

    prismaTransactionMock.mockImplementation(async (callback) =>
      callback({
        showEvent: {
          findMany: showEventFindManyMock,
          createMany: showEventCreateManyMock,
        },
        dogRegistration: {
          findMany: dogRegistrationFindManyMock,
        },
        showResultDefinition: {
          findMany: showResultDefinitionFindManyMock,
        },
        showEntry: {
          createMany: showEntryCreateManyMock,
        },
        showResultItem: {
          createMany: showResultItemCreateManyMock,
        },
      }),
    );
  });

  it("passes explicit transaction timeout options", async () => {
    showEventFindManyMock.mockResolvedValue([]);
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI1/24", dogId: "dog-1" },
    ]);
    showResultDefinitionFindManyMock.mockResolvedValue([
      { id: "def-sert", code: "SERT" },
    ]);
    showEventCreateManyMock.mockResolvedValue({ count: 1 });
    showEntryCreateManyMock.mockResolvedValue({ count: 1 });
    showResultItemCreateManyMock.mockResolvedValue({ count: 1 });

    await expect(
      writeAdminShowWorkbookImportDb({
        fileName: "Näyttelyt.xlsx",
        rows: [
          {
            rowNumber: 2,
            eventLookupKey: "2025-01-01|HELSINKI HALLI",
            eventDateIso: "2025-01-01",
            eventCity: "Helsinki",
            eventPlace: "Helsinki Halli",
            eventType: "Kansallinen",
            registrationNo: "FI1/24",
            dogName: "KOIRA",
            judge: null,
            critiqueText: null,
            resultItems: [
              {
                columnName: "SERT",
                definitionCode: "SERT",
                valueCode: null,
                valueNumeric: null,
              },
            ],
          },
        ],
      }),
    ).resolves.toEqual({
      eventsCreated: 1,
      entriesCreated: 1,
      itemsCreated: 1,
    });

    expect(prismaTransactionMock).toHaveBeenCalledTimes(1);
    expect(prismaTransactionMock.mock.calls[0]?.[1]).toEqual(
      WORKBOOK_IMPORT_WRITE_TX_CONFIG,
    );
  });

  it("rejects the whole write when any create step fails", async () => {
    showEventFindManyMock.mockResolvedValue([]);
    dogRegistrationFindManyMock.mockResolvedValue([]);
    showResultDefinitionFindManyMock.mockResolvedValue([
      { id: "def-sert", code: "SERT" },
    ]);
    showEventCreateManyMock.mockResolvedValue({ count: 1 });
    showEntryCreateManyMock.mockResolvedValue({ count: 1 });
    showResultItemCreateManyMock.mockRejectedValue(new Error("write failed"));

    await expect(
      writeAdminShowWorkbookImportDb({
        fileName: "Näyttelyt.xlsx",
        rows: [
          {
            rowNumber: 2,
            eventLookupKey: "2025-01-01|HELSINKI HALLI",
            eventDateIso: "2025-01-01",
            eventCity: "Helsinki",
            eventPlace: "Helsinki Halli",
            eventType: "Kansallinen",
            registrationNo: "FI1/24",
            dogName: "KOIRA",
            judge: null,
            critiqueText: null,
            resultItems: [
              {
                columnName: "SERT",
                definitionCode: "SERT",
                valueCode: null,
                valueNumeric: null,
              },
            ],
          },
        ],
      }),
    ).rejects.toThrow("write failed");
  });

  it("uses the resolved showEventId when creating entries", async () => {
    showEventFindManyMock.mockResolvedValue([]);
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI1/24", dogId: "dog-1" },
    ]);
    showResultDefinitionFindManyMock.mockResolvedValue([
      { id: "def-sert", code: "SERT" },
    ]);
    showEventCreateManyMock.mockResolvedValue({ count: 1 });
    showEntryCreateManyMock.mockResolvedValue({ count: 1 });
    showResultItemCreateManyMock.mockResolvedValue({ count: 1 });

    await writeAdminShowWorkbookImportDb({
      fileName: "Näyttelyt.xlsx",
      rows: [
        {
          rowNumber: 2,
          eventLookupKey: "2025-01-01|HELSINKI HALLI",
          eventDateIso: "2025-01-01",
          eventCity: "Helsinki",
          eventPlace: "Helsinki Halli",
          eventType: "Kansallinen",
          registrationNo: "FI1/24",
          dogName: "KOIRA",
          judge: null,
          critiqueText: null,
          resultItems: [],
        },
      ],
    });

    expect(showEntryCreateManyMock).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          showEventId: "uuid-fixed",
          registrationNoSnapshot: "FI1/24",
        }),
      ],
    });
  });

  it("keeps empty eventPlace values as strings", async () => {
    showEventFindManyMock.mockResolvedValue([]);
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI1/24", dogId: "dog-1" },
    ]);
    showResultDefinitionFindManyMock.mockResolvedValue([]);
    showEventCreateManyMock.mockResolvedValue({ count: 1 });
    showEntryCreateManyMock.mockResolvedValue({ count: 1 });
    showResultItemCreateManyMock.mockResolvedValue({ count: 0 });

    await writeAdminShowWorkbookImportDb({
      fileName: "Näyttelyt.xlsx",
      rows: [
        {
          rowNumber: 2,
          eventLookupKey: "2025-01-01|HELSINKI HALLI",
          eventDateIso: "2025-01-01",
          eventCity: "Helsinki",
          eventPlace: "",
          eventType: "Kansallinen",
          registrationNo: "FI1/24",
          dogName: "KOIRA",
          judge: null,
          critiqueText: null,
          resultItems: [],
        },
      ],
    });

    expect(showEventCreateManyMock).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          eventPlace: "",
        }),
      ],
    });
  });
});
