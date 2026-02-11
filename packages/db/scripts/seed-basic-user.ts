import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";
import { Role, prisma } from "../index";

const scrypt = promisify(nodeScrypt);

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function parseRole(value: string): Role {
  const normalized = value.trim().toUpperCase();
  if (normalized === "USER" || normalized === "ADMIN") {
    return normalized as Role;
  }
  throw new Error('SEED_TEST_USER_ROLE must be either "USER" or "ADMIN".');
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

async function main() {
  const email = getRequiredEnv("SEED_TEST_USER_EMAIL").toLowerCase();
  const password = getRequiredEnv("SEED_TEST_USER_PASSWORD");
  const role = parseRole(getRequiredEnv("SEED_TEST_USER_ROLE"));
  const username = process.env.SEED_TEST_USER_USERNAME?.trim() || undefined;

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      username,
      passwordHash,
      role,
    },
    update: {
      username,
      passwordHash,
      role,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log(
    `[seed] ensured basic user email=${user.email} role=${user.role} id=${user.id}`,
  );
}

main()
  .catch((error) => {
    console.error("[seed] failed to ensure basic user", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
