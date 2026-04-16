import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_TRIAL_DETAIL_PARITY_EXPECTED,
  ADMIN_TRIAL_DETAIL_PARITY_ROW,
} from "./fixtures/parity-samples";

const { trialEntryFindUniqueMock, prismaMock } = vi.hoisted(() => {
  const trialEntryFindUnique = vi.fn();

  return {
    trialEntryFindUniqueMock: trialEntryFindUnique,
    prismaMock: {
      trialEntry: {
        findUnique: trialEntryFindUnique,
      },
    },
  };
});

vi.mock("../../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { getAdminTrialDetailsDb } from "../get-trial-details";

describe("getAdminTrialDetailsDb parity sample", () => {
  beforeEach(() => {
    trialEntryFindUniqueMock.mockReset();
  });

  it("maps canonical row to BEJ-76 visible detail fields with parity sample", async () => {
    trialEntryFindUniqueMock.mockResolvedValue(ADMIN_TRIAL_DETAIL_PARITY_ROW);

    const result = await getAdminTrialDetailsDb({
      trialId: "entry-detail-1",
    });

    expect(result).toEqual(ADMIN_TRIAL_DETAIL_PARITY_EXPECTED);
    expect(result?.dogId).toBeNull();
    expect(result?.sklKoeId).toBeNull();
    expect(result?.entryKey).toBe("LEGACY:2026-01-15|REG:FI44444/18");
  });

  it("returns null when canonical entry is missing", async () => {
    trialEntryFindUniqueMock.mockResolvedValue(null);

    const result = await getAdminTrialDetailsDb({
      trialId: "missing-entry",
    });

    expect(result).toBeNull();
  });
});
