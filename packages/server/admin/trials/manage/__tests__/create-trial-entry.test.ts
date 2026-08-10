import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CreateAdminTrialEntryRequest,
  CurrentUserDto,
} from "@beagle/contracts";
import { createAdminTrialEntry } from "../create-trial-entry";

const { writeMock } = vi.hoisted(() => ({ writeMock: vi.fn() }));
vi.mock("@beagle/db", () => ({ createAdminTrialEntryWriteDb: writeMock }));

const admin: CurrentUserDto = {
  id: "u1",
  email: "a@example.com",
  username: null,
  role: "ADMIN",
};
const input: CreateAdminTrialEntryRequest = {
  trialEventId: "event-1",
  registrationNo: " fi12345/21 ",
  entry: {
    koemaasto: null,
    koemuoto: "AJOK",
    koetyyppi: "NORMAL",
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
  },
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
  lisatiedotRows: [],
};

describe("createAdminTrialEntry", () => {
  beforeEach(() => writeMock.mockReset());

  it("requires admin authorization", async () => {
    await expect(createAdminTrialEntry(input, null)).resolves.toMatchObject({
      status: 401,
      body: { ok: false, code: "UNAUTHENTICATED" },
    });
    expect(writeMock).not.toHaveBeenCalled();
  });

  it("normalizes registration before persistence", async () => {
    writeMock.mockResolvedValue({
      status: "created",
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });
    await expect(createAdminTrialEntry(input, admin)).resolves.toMatchObject({
      status: 201,
      body: { ok: true },
    });
    expect(writeMock).toHaveBeenCalledWith(
      expect.objectContaining({ canonicalRegistrationNo: "FI12345/21" }),
    );
  });

  it.each([
    ["event_not_found", 404, "TRIAL_EVENT_NOT_FOUND"],
    ["event_missing_skl_id", 409, "TRIAL_EVENT_MISSING_SKL_ID"],
    ["registration_conflict", 409, "TRIAL_ENTRY_REGISTRATION_CONFLICT"],
  ] as const)("maps %s", async (status, expectedStatus, code) => {
    writeMock.mockResolvedValue({ status });
    await expect(createAdminTrialEntry(input, admin)).resolves.toMatchObject({
      status: expectedStatus,
      body: { ok: false, code },
    });
  });

  it("uses stable validation categories", async () => {
    await expect(
      createAdminTrialEntry({ ...input, eras: [] }, admin),
    ).resolves.toMatchObject({
      status: 400,
      body: { ok: false, code: "INVALID_TRIAL_ERAS" },
    });
    await expect(
      createAdminTrialEntry({ ...input, registrationNo: "bad value" }, admin),
    ).resolves.toMatchObject({
      status: 400,
      body: { ok: false, code: "INVALID_REGISTRATION_NUMBER" },
    });
  });

  it("maps malformed runtime input to a stable validation error", async () => {
    await expect(
      createAdminTrialEntry(
        {
          ...input,
          entry: null,
        } as unknown as CreateAdminTrialEntryRequest,
        admin,
      ),
    ).resolves.toMatchObject({
      status: 400,
      body: { ok: false, code: "INVALID_TRIAL_ENTRY" },
    });
    expect(writeMock).not.toHaveBeenCalled();
  });

  it("rejects duplicate normalized lisatieto keys before persistence", async () => {
    const row = {
      koodi: "11",
      osa: "",
      nimi: null,
      jarjestys: 1,
      eraValues: [{ era: 1, arvo: "1" }],
    };

    await expect(
      createAdminTrialEntry(
        {
          ...input,
          lisatiedotRows: [row, { ...row, koodi: " 11 ", osa: " " }],
        },
        admin,
      ),
    ).resolves.toMatchObject({
      status: 400,
      body: { ok: false, code: "INVALID_TRIAL_ADDITIONAL_INFO" },
    });
    expect(writeMock).not.toHaveBeenCalled();
  });

  it("rejects duplicate lisatieto era values before persistence", async () => {
    await expect(
      createAdminTrialEntry(
        {
          ...input,
          lisatiedotRows: [
            {
              koodi: "11",
              osa: "",
              nimi: null,
              jarjestys: 1,
              eraValues: [
                { era: 1, arvo: "1" },
                { era: 1, arvo: "2" },
              ],
            },
          ],
        },
        admin,
      ),
    ).resolves.toMatchObject({
      status: 400,
      body: { ok: false, code: "INVALID_TRIAL_ADDITIONAL_INFO" },
    });
    expect(writeMock).not.toHaveBeenCalled();
  });

  it("returns safe row context for invalid lisatieto ordering", async () => {
    await expect(
      createAdminTrialEntry(
        {
          ...input,
          lisatiedotRows: [
            {
              koodi: "25",
              osa: "b",
              nimi: null,
              jarjestys: 25.1,
              eraValues: [{ era: 1, arvo: "1" }],
            },
          ],
        },
        admin,
      ),
    ).resolves.toMatchObject({
      status: 400,
      body: {
        code: "INVALID_TRIAL_ADDITIONAL_INFO",
        details: {
          area: "additional_info",
          reason: "invalid_lisatieto_order",
          koodi: "25",
          osa: "b",
        },
      },
    });
  });
});
