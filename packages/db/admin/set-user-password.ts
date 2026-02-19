import { randomUUID } from "node:crypto";
import { prisma } from "../core/prisma";

type SetAdminUserPasswordDbInput = {
  userId: string;
  passwordHash: string;
};

export async function setAdminUserPasswordDb(
  input: SetAdminUserPasswordDbInput,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
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
  });
}
