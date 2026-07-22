import { describe, expect, it } from "vitest";
import type { AdminTrialEventDetails } from "@beagle/contracts";
import {
  createAdminTrialEntryCreateDraft,
  toCreateAdminTrialEntryRequest,
} from "../entry-create-model";

const event: AdminTrialEventDetails = {
  trialEventId: "event-1",
  eventDate: "2026-07-21",
  eventPlace: "Helsinki",
  eventName: null,
  jarjestaja: null,
  ylituomari: "Judge",
  ylituomariNumero: "123",
  ytKertomus: null,
  kennelpiiri: null,
  kennelpiirinro: null,
  sklKoeId: 456,
  dogCount: 0,
  entries: [],
};

describe("manual trial entry create model", () => {
  it("starts clean with event judge defaults, NORMAL and one era", () => {
    const draft = createAdminTrialEntryCreateDraft(event);
    expect(draft.registrationNo).toBe("");
    expect(draft.entry).toMatchObject({
      koetyyppi: "NORMAL",
      judge: "Judge",
      ylituomariNumeroSnapshot: "123",
    });
    expect(draft.eras.map((era) => era.era)).toEqual([1]);
  });

  it("serializes the R1 request and keeps registration server normalization authoritative", () => {
    const draft = createAdminTrialEntryCreateDraft(event);
    draft.registrationNo = " FI 12345/21 ";
    const result = toCreateAdminTrialEntryRequest(event.trialEventId, draft);
    expect(result).toMatchObject({
      ok: true,
      request: {
        trialEventId: "event-1",
        registrationNo: "FI 12345/21",
        entry: { judge: "Judge" },
        eras: [{ era: 1 }],
      },
    });
  });

  it("rejects missing registration and malformed numeric input", () => {
    const draft = createAdminTrialEntryCreateDraft(event);
    expect(toCreateAdminTrialEntryRequest("event-1", draft)).toEqual({
      ok: false,
      section: "registration",
    });
    draft.registrationNo = "FI123";
    draft.entry.points = "bad";
    expect(toCreateAdminTrialEntryRequest("event-1", draft)).toEqual({
      ok: false,
      section: "entry",
    });
  });

  it("uses integer persistence order and omits empty lisatieto rows", () => {
    const draft = createAdminTrialEntryCreateDraft(event);
    draft.registrationNo = "FI43560/18";
    const row25b = draft.lisatiedotRows.find(
      (row) => row.koodi === "25" && row.osa === "b",
    );
    expect(row25b?.sortOrder).toBe(25.1);
    expect(Number.isInteger(row25b?.jarjestys)).toBe(true);
    if (row25b) row25b.eraValues[1] = "1";

    const result = toCreateAdminTrialEntryRequest("event-1", draft);
    expect(result).toMatchObject({
      ok: true,
      request: {
        lisatiedotRows: [
          expect.objectContaining({
            koodi: "25",
            osa: "b",
            jarjestys: expect.any(Number),
          }),
        ],
      },
    });
    if (result.ok) {
      expect(result.request.lisatiedotRows).toHaveLength(1);
      expect(Number.isInteger(result.request.lisatiedotRows[0].jarjestys)).toBe(
        true,
      );
    }
  });
});
