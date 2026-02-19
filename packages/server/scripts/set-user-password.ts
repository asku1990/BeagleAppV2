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
const repoRoot = path.resolve(thisDir, "../../..");

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

function toEnvFilePath(projectRoot: string, envFile: string): string {
  if (path.isAbsolute(envFile)) {
    return envFile;
  }
  return path.join(projectRoot, envFile);
}

function loadDefaultEnvFiles(): void {
  const projectRoot = path.resolve(thisDir, "../../../");
  const explicitEnvFile = process.env.SET_PASSWORD_ENV_FILE?.trim();
  const envFileCandidates = explicitEnvFile
    ? [explicitEnvFile]
    : [".env.local", ".env"];

  for (const envFileName of envFileCandidates) {
    loadEnvFromFile(toEnvFilePath(projectRoot, envFileName));
  }
}

loadDefaultEnvFiles();

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function normalizeEmail(rawEmail: string): string {
  const email = normalizeAndValidateEmailAddress(rawEmail);
  if (!email) {
    throw new Error("SET_PASSWORD_EMAIL must be a valid email address.");
  }
  return email;
}

function validatePassword(password: string): void {
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    throw new Error(
      `SET_PASSWORD_NEW_PASSWORD must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters.`,
    );
  }
}

async function main() {
  const email = normalizeEmail(getRequiredEnv("SET_PASSWORD_EMAIL"));
  const newPassword = getRequiredEnv("SET_PASSWORD_NEW_PASSWORD");
  validatePassword(newPassword);

  const user = await prisma.betterAuthUser.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }

  const hash = await hashPassword(newPassword);
  const credentialAccount = await prisma.betterAuthAccount.findFirst({
    where: {
      userId: user.id,
      providerId: "credential",
    },
    select: { id: true },
  });

  if (!credentialAccount) {
    throw new Error(
      `Credential account not found for email: ${email}. Run auth bootstrap first.`,
    );
  }

  const [, revokedSessions] = await prisma.$transaction([
    prisma.betterAuthAccount.update({
      where: { id: credentialAccount.id },
      data: { password: hash },
    }),
    prisma.betterAuthSession.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  console.log(
    `[set-user-password] updated password for ${email} and revoked ${revokedSessions.count} active session(s)`,
  );
}

main()
  .catch((error) => {
    console.error("[set-user-password] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
