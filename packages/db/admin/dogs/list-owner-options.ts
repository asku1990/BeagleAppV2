import { prisma } from "../../core/prisma";
import { normalizeQuery, parseLookupLimit } from "./normalization";

export type AdminOwnerLookupRequestDb = {
  query?: string;
  limit?: number;
};

export type AdminOwnerLookupOptionDb = {
  id: string;
  name: string;
};

export type AdminOwnerLookupResponseDb = {
  items: AdminOwnerLookupOptionDb[];
};

export async function listAdminOwnerOptionsDb(
  input: AdminOwnerLookupRequestDb,
): Promise<AdminOwnerLookupResponseDb> {
  const query = normalizeQuery(input.query);
  const limit = parseLookupLimit(input.limit);

  const rows = await prisma.owner.findMany({
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
