import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";

type SetAdminUserPasswordDbInput = {
  userId: string;
  passwordHash: string;
};

/**
 * Low-level write operation. Must be run inside an audited transaction
 * using `runAdminUserWriteTransactionDb`.
 */
export async function setAdminUserPasswordDb(
  input: SetAdminUserPasswordDbInput,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const credentialAccount = await tx.betterAuthAccount.findFirst({
    where: {
      userId: input.userId,
      providerId: "credential",
    },
    select: {
      id: true,
    },
  });

  if (!credentialAccount) {
    await tx.betterAuthAccount.create({
      data: {
        id: randomUUID(),
        accountId: input.userId,
        providerId: "credential",
        userId: input.userId,
        password: input.passwordHash,
      },
    });
  } else {
    await tx.betterAuthAccount.update({
      where: { id: credentialAccount.id },
      data: { password: input.passwordHash },
    });
  }

  await tx.betterAuthSession.deleteMany({
    where: { userId: input.userId },
  });
}
