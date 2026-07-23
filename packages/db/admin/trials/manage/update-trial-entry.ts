import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { prisma } from "@db/core/prisma";
import { Prisma } from "@prisma/client";
import type { AdminTrialEntryWriteDataDb } from "./trial-entry-write";

export type UpdateAdminTrialEntryWriteRequestDb = AdminTrialEntryWriteDataDb & {
  trialEventId: string;
  trialEntryId: string;
};

export type UpdateAdminTrialEntryWriteResultDb =
  | { status: "not_found" }
  | { status: "updated"; trialEventId: string; trialEntryId: string };

function toDecimalOrNull(value: number | null): Prisma.Decimal | null {
  return value === null ? null : new Prisma.Decimal(value);
}

export async function updateAdminTrialEntryWriteDb(
  input: UpdateAdminTrialEntryWriteRequestDb,
): Promise<UpdateAdminTrialEntryWriteResultDb> {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.trialEntry.updateMany({
      where: {
        id: input.trialEntryId,
        trialEventId: input.trialEventId,
      },
      data: {
        koemaasto: input.entry.koemaasto,
        koemuoto: input.entry.koemuoto,
        koetyyppi: input.entry.koetyyppi,
        ke: input.entry.ke,
        lk: input.entry.lk,
        pa: input.entry.award,
        sija: input.entry.rank,
        piste: toDecimalOrNull(input.entry.points),
        koiriaLuokassa: input.entry.koiriaLuokassa,
        hyvaksytytAjominuutit: input.entry.hyvaksytytAjominuutit,
        ajoajanPisteet: toDecimalOrNull(input.entry.ajoajanPisteet),
        haku: toDecimalOrNull(input.entry.haku),
        hauk: toDecimalOrNull(input.entry.hauk),
        yva: toDecimalOrNull(input.entry.yva),
        hlo: toDecimalOrNull(input.entry.hlo),
        alo: toDecimalOrNull(input.entry.alo),
        tja: toDecimalOrNull(input.entry.tja),
        pin: toDecimalOrNull(input.entry.pin),
        ansiopisteetYhteensa: toDecimalOrNull(input.entry.ansiopisteetYhteensa),
        tappiopisteetYhteensa: toDecimalOrNull(
          input.entry.tappiopisteetYhteensa,
        ),
        tuom1: input.entry.judge,
        huomautus: input.entry.huomautus,
        huomautusTeksti: input.entry.huomautusTeksti,
        ylituomariNumeroSnapshot: input.entry.ylituomariNumeroSnapshot,
        ryhmatuomariNimi: input.entry.ryhmatuomariNimi,
        palkintotuomariNimi: input.entry.palkintotuomariNimi,
        omistajaSnapshot: input.entry.omistajaSnapshot,
        omistajanKotikuntaSnapshot: input.entry.omistajanKotikuntaSnapshot,
      },
    });

    if (updated.count === 0) {
      return { status: "not_found" };
    }

    const requestedEras = new Set(input.eras.map((item) => item.era));
    await tx.trialEra.deleteMany({
      where: {
        trialEntryId: input.trialEntryId,
        era: { notIn: Array.from(requestedEras) },
      },
    });

    for (const era of input.eras) {
      const savedEra = await tx.trialEra.upsert({
        where: {
          trialEntryId_era: {
            trialEntryId: input.trialEntryId,
            era: era.era,
          },
        },
        create: {
          trialEntryId: input.trialEntryId,
          era: era.era,
          alkoi: era.alkoi,
          hakumin: era.hakumin,
          ajomin: era.ajomin,
          haku: toDecimalOrNull(era.haku),
          hauk: toDecimalOrNull(era.hauk),
          yva: toDecimalOrNull(era.yva),
          hlo: toDecimalOrNull(era.hlo),
          alo: toDecimalOrNull(era.alo),
          tja: toDecimalOrNull(era.tja),
          pin: toDecimalOrNull(era.pin),
          huomautusTeksti: era.huomautusTeksti,
        },
        update: {
          alkoi: era.alkoi,
          hakumin: era.hakumin,
          ajomin: era.ajomin,
          haku: toDecimalOrNull(era.haku),
          hauk: toDecimalOrNull(era.hauk),
          yva: toDecimalOrNull(era.yva),
          hlo: toDecimalOrNull(era.hlo),
          alo: toDecimalOrNull(era.alo),
          tja: toDecimalOrNull(era.tja),
          pin: toDecimalOrNull(era.pin),
          huomautusTeksti: era.huomautusTeksti,
        },
        select: { id: true, era: true },
      });

      const lisatiedotItems =
        input.lisatiedotByEra.find((item) => item.era === savedEra.era)
          ?.items ?? [];
      const replaceKeys =
        input.lisatiedotByEra.find((item) => item.era === savedEra.era)
          ?.replaceKeys ?? [];

      if (replaceKeys.length > 0) {
        await tx.trialEraLisatieto.deleteMany({
          where: {
            trialEraId: savedEra.id,
            OR: replaceKeys.map((item) => ({
              koodi: item.koodi,
              osa: item.osa,
            })),
          },
        });
      }

      if (lisatiedotItems.length > 0) {
        await tx.trialEraLisatieto.createMany({
          data: lisatiedotItems.map((item) => ({
            trialEraId: savedEra.id,
            koodi: item.koodi,
            osa: item.osa,
            arvo: item.arvo,
            nimi: item.nimi,
            jarjestys: item.jarjestys,
          })),
        });
      }
    }

    return {
      status: "updated",
      trialEventId: input.trialEventId,
      trialEntryId: input.trialEntryId,
    };
  }, ADMIN_WRITE_TX_CONFIG);
}
