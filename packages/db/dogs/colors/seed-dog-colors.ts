import { prisma } from "@db/core/prisma";
import { DOG_COLOR_DEFINITIONS } from "./definitions";

export async function seedDogColorsDb(): Promise<{ codes: number[] }> {
  for (const definition of DOG_COLOR_DEFINITIONS) {
    await prisma.dogColor.upsert({
      where: { code: definition.code },
      create: definition,
      update: {
        nameFi: definition.nameFi,
        nameSv: definition.nameSv,
        nameEn: definition.nameEn,
        status: definition.status,
      },
    });
  }

  return { codes: DOG_COLOR_DEFINITIONS.map((definition) => definition.code) };
}
