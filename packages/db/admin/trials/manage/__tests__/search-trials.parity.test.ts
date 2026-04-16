import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_TRIAL_LIST_PARITY_EXPECTED,
  ADMIN_TRIAL_LIST_PARITY_ROWS,
} from "./fixtures/parity-samples";

const { trialEntryCountMock, trialEntryFindManyMock, prismaMock } = vi.hoisted(
  () => {
    const trialEntryCount = vi.fn();
    const trialEntryFindMany = vi.fn();

    return {
      trialEntryCountMock: trialEntryCount,
      trialEntryFindManyMock: trialEntryFindMany,
      prismaMock: {
        trialEntry: {
          count: trialEntryCount,
          findMany: trialEntryFindMany,
        },
      },
    };
  },
);

vi.mock("../../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { searchAdminTrialsDb } from "../search-trials";

describe("searchAdminTrialsDb parity sample", () => {
  beforeEach(() => {
    trialEntryCountMock.mockReset();
    trialEntryFindManyMock.mockReset();
  });

  it("maps canonical rows to BEJ-75 visible list fields with parity samples", async () => {
    trialEntryCountMock.mockResolvedValue(ADMIN_TRIAL_LIST_PARITY_ROWS.length);
    trialEntryFindManyMock.mockResolvedValue(ADMIN_TRIAL_LIST_PARITY_ROWS);

    const result = await searchAdminTrialsDb({
      query: undefined,
      page: 1,
      pageSize: 50,
      sort: "date-desc",
    });

    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.items).toEqual(ADMIN_TRIAL_LIST_PARITY_EXPECTED);

    expect(result.items[1]?.sklKoeId).toBeNull();
    expect(result.items[1]?.entryKey).toBe("LEGACY:2026-01-13|REG:FI22222/20");
    expect(result.items[2]?.registrationNo).toBe("FI33333/19");
  });
});
