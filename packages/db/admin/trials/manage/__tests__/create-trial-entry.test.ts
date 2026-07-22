import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { createAdminTrialEntryWriteDb } from "../create-trial-entry";

const { prismaTransaction, tx } = vi.hoisted(() => {
  const transaction = {
    trialEvent: { findUnique: vi.fn() },
    trialEntry: { findFirst: vi.fn(), create: vi.fn() },
    dogRegistration: { findUnique: vi.fn() },
    trialEra: { create: vi.fn() },
    trialEraLisatieto: { createMany: vi.fn() },
  };
  return {
    tx: transaction,
    prismaTransaction: vi.fn((callback) => callback(transaction)),
  };
});
vi.mock("@db/core/prisma", () => ({
  prisma: { $transaction: prismaTransaction },
}));

const entry = {
  koemaasto: null,
  koemuoto: "AJOK",
  koetyyppi: "NORMAL" as const,
  ke: null,
  lk: null,
  award: null,
  rank: null,
  points: null,
  koiriaLuokassa: null,
  hyvaksytytAjominuutit: null,
  ajoajanPisteet: null,
  haku: null,
  hauk: null,
  yva: null,
  hlo: null,
  alo: null,
  tja: null,
  pin: null,
  ansiopisteetYhteensa: null,
  tappiopisteetYhteensa: null,
  judge: null,
  huomautus: null,
  huomautusTeksti: null,
  ylituomariNumeroSnapshot: null,
  ryhmatuomariNimi: null,
  palkintotuomariNimi: null,
  omistajaSnapshot: null,
  omistajanKotikuntaSnapshot: null,
};
const input = {
  trialEventId: "event-1",
  canonicalRegistrationNo: "FI12345/21",
  entry,
  eras: [
    {
      era: 1,
      alkoi: null,
      hakumin: null,
      ajomin: null,
      haku: null,
      hauk: null,
      yva: null,
      hlo: null,
      alo: null,
      tja: null,
      pin: null,
      huomautusTeksti: null,
    },
  ],
  lisatiedotByEra: [
    {
      era: 1,
      replaceKeys: [],
      items: [
        { koodi: "11", osa: "", arvo: "1", nimi: "Paljas maa", jarjestys: 1 },
      ],
    },
  ],
};

describe("createAdminTrialEntryWriteDb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaTransaction.mockImplementation((callback) => callback(tx));
    tx.trialEvent.findUnique.mockResolvedValue({
      id: "event-1",
      sklKoeId: 123,
    });
    tx.trialEntry.findFirst.mockResolvedValue(null);
    tx.dogRegistration.findUnique.mockResolvedValue({ dogId: "dog-1" });
    tx.trialEntry.create.mockResolvedValue({ id: "entry-1" });
    tx.trialEra.create.mockResolvedValue({ id: "era-1", era: 1 });
  });

  it("creates a linked manual entry with canonical identity and nested rows", async () => {
    await expect(createAdminTrialEntryWriteDb(input)).resolves.toEqual({
      status: "created",
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });
    expect(tx.dogRegistration.findUnique).toHaveBeenCalledWith({
      where: { registrationNo: "FI12345/21" },
      select: { dogId: true },
    });
    expect(tx.trialEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dogId: "dog-1",
          rekisterinumeroSnapshot: "FI12345/21",
          yksilointiAvain: "SKL:123|REG:FI12345/21",
          lahde: "MANUAL_ADMIN",
        }),
      }),
    );
    expect(tx.trialEraLisatieto.createMany).toHaveBeenCalledOnce();
  });

  it("permits an unlinked result", async () => {
    tx.dogRegistration.findUnique.mockResolvedValue(null);
    await createAdminTrialEntryWriteDb(input);
    expect(tx.trialEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ dogId: null }),
      }),
    );
  });

  it("returns typed event and duplicate outcomes before writing", async () => {
    tx.trialEvent.findUnique.mockResolvedValueOnce(null);
    await expect(createAdminTrialEntryWriteDb(input)).resolves.toEqual({
      status: "event_not_found",
    });
    tx.trialEvent.findUnique.mockResolvedValueOnce({
      id: "event-1",
      sklKoeId: null,
    });
    await expect(createAdminTrialEntryWriteDb(input)).resolves.toEqual({
      status: "event_missing_skl_id",
    });
    tx.trialEntry.findFirst.mockResolvedValueOnce({ id: "existing" });
    await expect(createAdminTrialEntryWriteDb(input)).resolves.toEqual({
      status: "registration_conflict",
    });
  });

  it("maps a database identity constraint race to registration conflict", async () => {
    prismaTransaction.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["trialEventId", "rekisterinumeroSnapshot"] },
      }),
    );
    await expect(createAdminTrialEntryWriteDb(input)).resolves.toEqual({
      status: "registration_conflict",
    });
  });
});
