import { prisma } from "@db/core/prisma";

export async function findAdminDogColorOptionDb(code: number) {
  return prisma.dogColor.findUnique({
    where: { code },
    select: { code: true, status: true },
  });
}
