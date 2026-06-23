import { prisma } from "@db/core/prisma";

export type AdminDogColorLookupOptionDb = {
  code: number;
  nameFi: string;
  nameSv: string | null;
  nameEn: string | null;
  status: "SELECTABLE" | "HIDDEN" | "LEGACY_UNKNOWN";
};

export type AdminDogColorLookupResponseDb = {
  items: AdminDogColorLookupOptionDb[];
};

export async function listAdminDogColorOptionsDb(): Promise<AdminDogColorLookupResponseDb> {
  const rows = await prisma.dogColor.findMany({
    select: {
      code: true,
      nameFi: true,
      nameSv: true,
      nameEn: true,
      status: true,
    },
    orderBy: { code: "asc" },
  });

  return { items: rows };
}
