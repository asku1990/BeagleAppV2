import type { Prisma } from "@prisma/client";

const kennelKey = (name: string) => name.trim().toLocaleLowerCase("fi-FI");

export async function findDogImportBreeders(
  db: Pick<Prisma.TransactionClient, "breeder">,
  kennelNames: readonly (string | null)[],
) {
  type Breeder = { id: string; name: string };
  const matchesByName = new Map<string, Breeder[]>();
  const byKey = new Map<string, Breeder[]>();
  for (const name of kennelNames) {
    if (!name) continue;
    const key = kennelKey(name);
    const matches = byKey.get(key) ?? [];
    byKey.set(key, matches);
    matchesByName.set(name, matches);
  }
  if (matchesByName.size === 0) return matchesByName;

  const breeders = await db.breeder.findMany({
    select: { id: true, name: true },
  });
  for (const breeder of breeders) {
    byKey.get(kennelKey(breeder.name))?.push(breeder);
  }
  return matchesByName;
}
