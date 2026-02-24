import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "./resolve-database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const configuredDatabaseUrl = resolveDatabaseUrl();
const adapter = new PrismaPg({ connectionString: configuredDatabaseUrl });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
