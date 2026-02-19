import { prisma } from "../core/prisma";

type SetAdminUserStatusDbInput = {
  userId: string;
  status: "active" | "suspended";
};

export async function setAdminUserStatusDb(
  input: SetAdminUserStatusDbInput,
): Promise<void> {
  const banned = input.status === "suspended";

  await prisma.$transaction(async (tx) => {
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
  });
}
