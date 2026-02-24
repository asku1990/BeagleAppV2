import type { Prisma } from "@prisma/client";

type SetAdminUserStatusDbInput = {
  userId: string;
  status: "active" | "suspended";
};

/**
 * Low-level write operation. Must be run inside an audited transaction
 * using `runAdminUserWriteTransactionDb`.
 */
export async function setAdminUserStatusDb(
  input: SetAdminUserStatusDbInput,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const banned = input.status === "suspended";

  await tx.betterAuthUser.update({
    where: { id: input.userId },
    data: {
      banned,
      banReason: banned ? "Suspended by admin" : null,
      banExpires: null,
    },
  });

  if (banned) {
    await tx.betterAuthSession.deleteMany({
      where: { userId: input.userId },
    });
  }
}
