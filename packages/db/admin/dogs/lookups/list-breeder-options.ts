import { prisma } from "../../../core/prisma";
import { normalizeQuery, parseLookupLimit } from "../manage/normalization";

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

export async function listAdminBreederOptionsDb(
  input: AdminBreederLookupRequestDb,
): Promise<AdminBreederLookupResponseDb> {
  const query = normalizeQuery(input.query);
  const limit = parseLookupLimit(input.limit);

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
