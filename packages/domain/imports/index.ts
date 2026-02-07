import { prisma } from "@beagle/db";

export async function importDog(payload: { name: string; breed?: string }) {
  // Placeholder import path; replace with domain-specific model writes.
  await prisma.$executeRaw`SELECT 1`;
  return {
    imported: 1,
    payload,
  };
}
