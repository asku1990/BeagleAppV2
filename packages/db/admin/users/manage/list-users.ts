import { prisma } from "../../../core/prisma";

export type AdminUserRowDb = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  banned: boolean;
  createdAt: Date;
  lastSignInAt: Date | null;
};

export async function listAdminUsersDb(): Promise<AdminUserRowDb[]> {
  const users = await prisma.betterAuthUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      banned: true,
      createdAt: true,
      sessions: {
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    banned: user.banned,
    createdAt: user.createdAt,
    lastSignInAt: user.sessions[0]?.createdAt ?? null,
  }));
}
