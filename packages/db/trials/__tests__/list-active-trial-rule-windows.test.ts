import { beforeEach, describe, expect, it, vi } from "vitest";
import { listActiveTrialRuleWindowsDb } from "../list-active-trial-rule-windows";

const { ruleWindowFindManyMock } = vi.hoisted(() => ({
  ruleWindowFindManyMock: vi.fn(),
}));

vi.mock("@db/core/prisma", () => ({
  prisma: { trialRuleWindow: { findMany: ruleWindowFindManyMock } },
}));

describe("listActiveTrialRuleWindowsDb", () => {
  beforeEach(() => {
    ruleWindowFindManyMock.mockReset();
  });

  it("loads the minimal active rule-window shape in resolution order", async () => {
    const rows = [{ id: "window-1", fromYmd: 20200101, toYmd: null }];
    ruleWindowFindManyMock.mockResolvedValue(rows);

    await expect(listActiveTrialRuleWindowsDb()).resolves.toBe(rows);
    expect(ruleWindowFindManyMock).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        fromYmd: true,
        toYmd: true,
      },
    });
  });
});
