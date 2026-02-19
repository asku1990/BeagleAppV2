import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "better-auth/crypto";
import {
  normalizeAndValidateEmailAddress,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@beagle/contracts";
import { prisma } from "@beagle/db";

const thisDir = path.dirname(fileURLToPath(import.meta.url));

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function loadEnvFromFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    const rawValue = line.slice(equalsIndex + 1).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = stripWrappingQuotes(rawValue);
  }
}

loadEnvFromFile(path.resolve(thisDir, "../../../.env"));

type BootstrapStatus = "created" | "promoted" | "already-admin";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function normalizeEmail(rawEmail: string): string {
  const email = normalizeAndValidateEmailAddress(rawEmail);
  if (!email && !rawEmail.trim()) {
    throw new Error("BOOTSTRAP_ADMIN_EMAIL must not be empty.");
  }

  if (!email) {
    throw new Error("BOOTSTRAP_ADMIN_EMAIL must be a valid email address.");
  }

  return email;
}

function resolveName(email: string): string {
  const explicitName = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
  if (explicitName) {
    return explicitName;
  }

  const localPart = email.split("@")[0]?.trim();
  if (!localPart) {
    throw new Error(
      "BOOTSTRAP_ADMIN_NAME is required when email local-part is empty.",
    );
  }
  return localPart;
}

function validatePassword(password: string): void {
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    throw new Error(
      `BOOTSTRAP_ADMIN_PASSWORD must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters.`,
    );
  }
}

async function ensureCredentialAccount(
  userId: string,
  passwordHash: string,
): Promise<boolean> {
  const credentialAccount = await prisma.betterAuthAccount.findFirst({
    where: {
      userId,
      providerId: "credential",
    },
    select: {
      id: true,
      password: true,
    },
  });

  if (!credentialAccount) {
    await prisma.betterAuthAccount.create({
      data: {
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: passwordHash,
      },
    });
    return true;
  }

  if (!credentialAccount.password) {
    await prisma.betterAuthAccount.update({
      where: { id: credentialAccount.id },
      data: { password: passwordHash },
    });
    return true;
  }

  return false;
}

async function bootstrapAdmin(): Promise<BootstrapStatus> {
  const email = normalizeEmail(getRequiredEnv("BOOTSTRAP_ADMIN_EMAIL"));
  const password = getRequiredEnv("BOOTSTRAP_ADMIN_PASSWORD");
  const name = resolveName(email);
  validatePassword(password);

  const passwordHash = await hashPassword(password);
  const existingUser = await prisma.betterAuthUser.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
    },
  });

  if (!existingUser) {
    const userId = randomUUID();
    await prisma.$transaction([
      prisma.betterAuthUser.create({
        data: {
          id: userId,
          email,
          emailVerified: true,
          name,
          role: "ADMIN",
        },
      }),
      prisma.betterAuthAccount.create({
        data: {
          id: randomUUID(),
          accountId: userId,
          providerId: "credential",
          userId,
          password: passwordHash,
        },
      }),
    ]);

    return "created";
  }

  let changed = false;

  if (existingUser.role !== "ADMIN") {
    await prisma.betterAuthUser.update({
      where: { id: existingUser.id },
      data: { role: "ADMIN" },
    });
    changed = true;
  }

  const credentialUpdated = await ensureCredentialAccount(
    existingUser.id,
    passwordHash,
  );
  if (credentialUpdated) {
    changed = true;
  }

  return changed ? "promoted" : "already-admin";
}

async function main() {
  const status = await bootstrapAdmin();
  console.log(`[bootstrap-admin] ${status}`);
}

main()
  .catch((error) => {
    console.error("[bootstrap-admin] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
