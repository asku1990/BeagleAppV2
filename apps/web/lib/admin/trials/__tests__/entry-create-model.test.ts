import { describe, expect, it } from "vitest";
import type { AdminTrialEventDetails } from "@beagle/contracts";
import {
  createAdminTrialEntryCreateDraft,
  toCreateAdminTrialEntryRequest,
} from "../entry-create-model";
import { resolveResultCreateFieldSet } from "../result-create-field-registry";

const event: AdminTrialEventDetails = {
  trialEventId: "event-1",
  trialRuleWindowId: "trw_post_20230801",
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

  it.each(["koiriaLuokassa", "hyvaksytytAjominuutit"] as const)(
    "rejects oversized entry integer input in %s",
    (field) => {
      const draft = createAdminTrialEntryCreateDraft(event);
      draft.registrationNo = "FI123";
      draft.entry[field] = "9".repeat(400);

      expect(toCreateAdminTrialEntryRequest("event-1", draft)).toEqual({
        ok: false,
        section: "entry",
      });
    },
  );

  it.each(["hakumin", "ajomin"] as const)(
    "rejects oversized era integer input in %s",
    (field) => {
      const draft = createAdminTrialEntryCreateDraft(event);
      draft.registrationNo = "FI123";
      draft.eras[0][field] = "9".repeat(400);

      expect(toCreateAdminTrialEntryRequest("event-1", draft)).toEqual({
        ok: false,
        section: "eras",
      });
    },
  );

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

  it("serializes only the resolved 2023+ rows through registry persistence mapping", () => {
    const fieldSet = resolveResultCreateFieldSet(event.trialRuleWindowId);
    const draft = createAdminTrialEntryCreateDraft(event, fieldSet);
    draft.registrationNo = "FI43560/18";

    expect(
      draft.lisatiedotRows.some((row) => row.koodi === "25" && row.osa === "b"),
    ).toBe(false);
    const marker = draft.lisatiedotRows.find((row) => row.koodi === "10");
    if (marker) marker.eraValues[1] = "0";

    const result = toCreateAdminTrialEntryRequest("event-1", draft);
    expect(result).toMatchObject({
      ok: true,
      request: {
        lisatiedotRows: [],
      },
    });
  });

  it("preserves generic marker values in compatibility fallback", () => {
    const fieldSet = resolveResultCreateFieldSet(null);
    const draft = createAdminTrialEntryCreateDraft(event, fieldSet);
    draft.registrationNo = "FI43560/18";
    const marker = draft.lisatiedotRows.find((row) => row.koodi === "10");
    if (marker) marker.eraValues[1] = "0";

    const result = toCreateAdminTrialEntryRequest("event-1", draft);

    expect(result).toMatchObject({
      ok: true,
      request: {
        lisatiedotRows: [
          expect.objectContaining({
            koodi: "10",
            eraValues: [{ era: 1, arvo: "0" }],
          }),
        ],
      },
    });
  });
});
