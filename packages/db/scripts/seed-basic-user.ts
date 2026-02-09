import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";
import { Role, prisma } from "../index";

const scrypt = promisify(nodeScrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

async function main() {
  const email = process.env.SEED_TEST_USER_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_TEST_USER_PASSWORD ?? "test1234";
  const role = (
    process.env.SEED_TEST_USER_ROLE?.toUpperCase() === "USER" ? "USER" : "ADMIN"
  ) as Role;
  const username = process.env.SEED_TEST_USER_USERNAME ?? "admin";

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
