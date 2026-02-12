import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(thisDir, "../../../.env") });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const configuredDatabaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:password@127.0.0.1:5432/beagle_db_v2";
const adapter = new PrismaPg({ connectionString: configuredDatabaseUrl });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
