import { prisma } from "../../core/prisma";

export type AdminBreederLookupRequestDb = {
  query?: string;
  limit?: number;
};

export type AdminBreederLookupOptionDb = {
  id: string;
  name: string;
};

export type AdminBreederLookupResponseDb = {
  items: AdminBreederLookupOptionDb[];
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(value ?? DEFAULT_LIMIT)));
}

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim();
}

export async function listAdminBreederOptionsDb(
  input: AdminBreederLookupRequestDb,
): Promise<AdminBreederLookupResponseDb> {
  const query = normalizeQuery(input.query);
  const limit = parseLimit(input.limit);

  const rows = await prisma.breeder.findMany({
    where:
      query.length > 0
        ? {
            name: { contains: query, mode: "insensitive" },
          }
        : undefined,
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
    take: limit,
  });

  return {
    items: rows.map((row) => ({ id: row.id, name: row.name })),
  };
}
