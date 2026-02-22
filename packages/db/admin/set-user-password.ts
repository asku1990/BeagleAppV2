import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import {
  runInAuditContextDb,
  type AuditContextDb,
} from "../core/audit-context";

type SetAdminUserPasswordDbInput = {
  userId: string;
  passwordHash: string;
};

export async function setAdminUserPasswordDb(
  input: SetAdminUserPasswordDbInput,
  auditContext?: AuditContextDb,
): Promise<void> {
  const runUpdate = async (tx: Prisma.TransactionClient) => {
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
  };

  await runInAuditContextDb(auditContext ?? {}, runUpdate);
}
