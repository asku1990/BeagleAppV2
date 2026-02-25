import type { DogSex } from "@prisma/client";
import { prisma } from "../../core/prisma";

export type AdminDogParentLookupRequestDb = {
  query?: string;
  limit?: number;
};

export type AdminDogParentLookupOptionDb = {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  registrationNo: string | null;
};

export type AdminDogParentLookupResponseDb = {
  items: AdminDogParentLookupOptionDb[];
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

function mapSex(value: DogSex): "MALE" | "FEMALE" | "UNKNOWN" {
  return value;
}

export async function listAdminDogParentOptionsDb(
  input: AdminDogParentLookupRequestDb,
): Promise<AdminDogParentLookupResponseDb> {
  const query = normalizeQuery(input.query);
  const limit = parseLimit(input.limit);

  const rows = await prisma.dog.findMany({
    where:
      query.length > 0
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              {
                registrations: {
                  some: {
                    registrationNo: { contains: query, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : undefined,
    select: {
      id: true,
      name: true,
      sex: true,
      registrations: {
        select: {
          registrationNo: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: limit,
  });

  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      sex: mapSex(row.sex),
      registrationNo: row.registrations[0]?.registrationNo ?? null,
    })),
  };
}
