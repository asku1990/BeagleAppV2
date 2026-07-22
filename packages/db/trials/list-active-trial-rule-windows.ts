import { prisma } from "@db/core/prisma";

export type ActiveTrialRuleWindowDb = {
  id: string;
  fromYmd: number | null;
  toYmd: number | null;
};

// Loads active rule windows in deterministic rule-resolution order.
export async function listActiveTrialRuleWindowsDb(): Promise<
  ActiveTrialRuleWindowDb[]
> {
  return prisma.trialRuleWindow.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      fromYmd: true,
      toYmd: true,
    },
  });
}
