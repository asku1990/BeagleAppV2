import { beforeEach, describe, expect, it, vi } from "vitest";
import { upsertCanonicalTrialRows } from "../upsert-canonical-trial-rows";

const { upsertTrialEventMock, upsertTrialEntryMock } = vi.hoisted(() => ({
  upsertTrialEventMock: vi.fn(),
  upsertTrialEntryMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  upsertTrialEventByLegacyKeyDb: upsertTrialEventMock,
  upsertTrialEntryByEventAndRegistrationDb: upsertTrialEntryMock,
}));

describe("upsertCanonicalTrialRows", () => {
  beforeEach(() => {
    upsertTrialEventMock.mockReset();
    upsertTrialEntryMock.mockReset();
    upsertTrialEventMock.mockResolvedValue({ id: "event-1" });
    upsertTrialEntryMock.mockResolvedValue(undefined);
  });

  it("skips invalid registration rows and reports warning", async () => {
    const result = await upsertCanonicalTrialRows(
      [
        {
          registrationNo: "FI 1/24",
          eventPlace: "Oulu",
          eventDateRaw: "20240101",
          kennelDistrict: null,
          kennelDistrictNo: null,
          ke: null,
          lk: null,
          pa: null,
          piste: null,
          sija: null,
          haku: null,
          hauk: null,
          yva: null,
          hlo: null,
          alo: null,
          tja: null,
          pin: null,
          judge: null,
          legacyFlag: null,
        },
      ],
      new Map(),
    );

    expect(result.upserted).toBe(0);
    expect(result.errors).toBe(1);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "WARNING",
          code: "TRIAL_CANONICAL_REGISTRATION_INVALID_FORMAT",
        }),
      ]),
    );
    expect(upsertTrialEventMock).not.toHaveBeenCalled();
    expect(upsertTrialEntryMock).not.toHaveBeenCalled();
  });

  it("upserts canonical event and entry with deterministic identity key", async () => {
    const result = await upsertCanonicalTrialRows(
      [
        {
          registrationNo: "FI-1/24",
          eventPlace: " Oulu ",
          eventDateRaw: "20240101",
          kennelDistrict: "PK",
          kennelDistrictNo: "8",
          ke: "PALJAS",
          lk: null,
          pa: "AVO1",
          piste: "82.5",
          sija: "1",
          haku: "8.5",
          hauk: "9.0",
          yva: "7.0",
          hlo: "2.0",
          alo: "1.5",
          tja: "5.0",
          pin: "6.0",
          judge: "Judge One",
          legacyFlag: "L",
        },
      ],
      new Map([["FI-1/24", "dog-1"]]),
    );

    expect(result.upserted).toBe(1);
    expect(result.errors).toBe(0);
    expect(upsertTrialEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        legacyEventKey: "2024-01-01|oulu|pk|8",
      }),
    );
    expect(upsertTrialEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        trialEventId: "event-1",
        rekisterinumeroSnapshot: "FI-1/24",
        dogId: "dog-1",
        luopui: true,
      }),
    );
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "TRIAL_CANONICAL_UNMAPPED_FIELDS",
          severity: "INFO",
        }),
      ]),
    );
  });

  it("maps combined legacy flags using contains semantics", async () => {
    await upsertCanonicalTrialRows(
      [
        {
          registrationNo: "FI-1/24",
          eventPlace: "Oulu",
          eventDateRaw: "20240101",
          kennelDistrict: null,
          kennelDistrictNo: null,
          ke: null,
          lk: null,
          pa: null,
          piste: null,
          sija: null,
          haku: null,
          hauk: null,
          yva: null,
          hlo: null,
          alo: null,
          tja: null,
          pin: null,
          judge: null,
          legacyFlag: "LS",
        },
      ],
      new Map([["FI-1/24", "dog-1"]]),
    );

    expect(upsertTrialEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        luopui: true,
        suljettu: true,
        keskeytetty: false,
      }),
    );
  });
});
