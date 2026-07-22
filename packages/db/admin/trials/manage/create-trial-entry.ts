import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { prisma } from "@db/core/prisma";
import { Prisma, type TrialSourceTag } from "@prisma/client";
import { buildTrialEntryIdentity } from "@db/trials/core/trial-entry-identity";
import type { AdminTrialEntryWriteDataDb } from "./trial-entry-write";

export type CreateAdminTrialEntryWriteRequestDb = AdminTrialEntryWriteDataDb & {
  trialEventId: string;
  canonicalRegistrationNo: string;
};

export type CreateAdminTrialEntryWriteResultDb =
  | { status: "event_not_found" }
  | { status: "event_missing_skl_id" }
  | { status: "registration_conflict" }
  | { status: "created"; trialEventId: string; trialEntryId: string };

function decimal(value: number | null): Prisma.Decimal | null {
  return value === null ? null : new Prisma.Decimal(value);
}

function isEntryIdentityConflict(error: unknown): boolean {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }
  const target = error.meta?.target;
  const fields = Array.isArray(target)
    ? target.map(String)
    : [String(target ?? "")];
  return fields.some(
    (field) =>
      field.includes("yksilointiAvain") ||
      field.includes("trialEventId_rekisterinumeroSnapshot") ||
      field.includes("trialEventId") ||
      field.includes("rekisterinumeroSnapshot"),
  );
}

// Creates one complete manual result and all nested rows atomically.
export async function createAdminTrialEntryWriteDb(
  input: CreateAdminTrialEntryWriteRequestDb,
): Promise<CreateAdminTrialEntryWriteResultDb> {
  try {
    return await prisma.$transaction(async (tx) => {
      const event = await tx.trialEvent.findUnique({
        where: { id: input.trialEventId },
        select: { id: true, sklKoeId: true },
      });
      if (!event) return { status: "event_not_found" } as const;
      if (event.sklKoeId === null)
        return { status: "event_missing_skl_id" } as const;
      const yksilointiAvain = buildTrialEntryIdentity(
        event.sklKoeId,
        input.canonicalRegistrationNo,
      );

      const duplicate = await tx.trialEntry.findFirst({
        where: {
          OR: [
            { yksilointiAvain },
            {
              trialEventId: event.id,
              rekisterinumeroSnapshot: input.canonicalRegistrationNo,
            },
          ],
        },
        select: { id: true },
      });
      if (duplicate) return { status: "registration_conflict" } as const;

      const registration = await tx.dogRegistration.findUnique({
        where: { registrationNo: input.canonicalRegistrationNo },
        select: { dogId: true },
      });
      const entry = input.entry;
      const created = await tx.trialEntry.create({
        data: {
          trialEventId: event.id,
          dogId: registration?.dogId ?? null,
          yksilointiAvain,
          lahde: "MANUAL_ADMIN" as TrialSourceTag,
          rekisterinumeroSnapshot: input.canonicalRegistrationNo,
          raakadataJson: null,
          koemaasto: entry.koemaasto,
          koemuoto: entry.koemuoto,
          koetyyppi: entry.koetyyppi,
          ke: entry.ke,
          lk: entry.lk,
          pa: entry.award,
          sija: entry.rank,
          piste: decimal(entry.points),
          koiriaLuokassa: entry.koiriaLuokassa,
          hyvaksytytAjominuutit: entry.hyvaksytytAjominuutit,
          ajoajanPisteet: decimal(entry.ajoajanPisteet),
          haku: decimal(entry.haku),
          hauk: decimal(entry.hauk),
          yva: decimal(entry.yva),
          hlo: decimal(entry.hlo),
          alo: decimal(entry.alo),
          tja: decimal(entry.tja),
          pin: decimal(entry.pin),
          ansiopisteetYhteensa: decimal(entry.ansiopisteetYhteensa),
          tappiopisteetYhteensa: decimal(entry.tappiopisteetYhteensa),
          tuom1: entry.judge,
          huomautus: entry.huomautus,
          huomautusTeksti: entry.huomautusTeksti,
          ylituomariNumeroSnapshot: entry.ylituomariNumeroSnapshot,
          ryhmatuomariNimi: entry.ryhmatuomariNimi,
          palkintotuomariNimi: entry.palkintotuomariNimi,
          omistajaSnapshot: entry.omistajaSnapshot,
          omistajanKotikuntaSnapshot: entry.omistajanKotikuntaSnapshot,
        },
        select: { id: true },
      });

      for (const eraWrite of input.eras) {
        const era = await tx.trialEra.create({
          data: {
            trialEntryId: created.id,
            era: eraWrite.era,
            alkoi: eraWrite.alkoi,
            hakumin: eraWrite.hakumin,
            ajomin: eraWrite.ajomin,
            haku: decimal(eraWrite.haku),
            hauk: decimal(eraWrite.hauk),
            yva: decimal(eraWrite.yva),
            hlo: decimal(eraWrite.hlo),
            alo: decimal(eraWrite.alo),
            tja: decimal(eraWrite.tja),
            pin: decimal(eraWrite.pin),
            huomautusTeksti: eraWrite.huomautusTeksti,
            raakadataJson: null,
          },
          select: { id: true, era: true },
        });
        const items =
          input.lisatiedotByEra.find((item) => item.era === era.era)?.items ??
          [];
        if (items.length) {
          await tx.trialEraLisatieto.createMany({
            data: items.map((item) => ({ trialEraId: era.id, ...item })),
          });
        }
      }

      return {
        status: "created",
        trialEventId: event.id,
        trialEntryId: created.id,
      } as const;
    }, ADMIN_WRITE_TX_CONFIG);
  } catch (error) {
    if (isEntryIdentityConflict(error))
      return { status: "registration_conflict" };
    throw error;
  }
}
