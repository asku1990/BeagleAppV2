import { describe, expect, it } from "vitest";
import type { AdminTrialEntryWriteData } from "@beagle/contracts";
import { parseAdminTrialEntryWriteInput } from "../parse-admin-trial-entry-write-input";

function createInput(): AdminTrialEntryWriteData {
  return {
    entry: {
      koemaasto: " Forest ",
      koemuoto: " AJOK ",
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
    lisatiedotRows: [
      {
        koodi: " 11 ",
        osa: " ",
        nimi: " Paljas maa ",
        jarjestys: 1,
        eraValues: [{ era: 1, arvo: " 1 " }],
      },
    ],
  };
}

describe("parseAdminTrialEntryWriteInput", () => {
  it("normalizes the shared write shape", () => {
    const result = parseAdminTrialEntryWriteInput(createInput(), {
      mode: "create",
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        entry: { koemaasto: "Forest", koemuoto: "AJOK" },
        eras: [{ era: 1 }],
        lisatiedotByEra: [
          {
            era: 1,
            items: [
              {
                koodi: "11",
                osa: "",
                nimi: "Paljas maa",
                arvo: "1",
                jarjestys: 1,
              },
            ],
          },
        ],
      },
    });
  });

  it("returns detailed issue categories for service-specific mappings", () => {
    expect(
      parseAdminTrialEntryWriteInput(
        { ...createInput(), eras: [] },
        { mode: "create" },
      ),
    ).toEqual({
      ok: false,
      issue: { area: "eras", reason: "missing_eras" },
    });
  });

  it.each([
    { koodi: " 11 ", osa: " " },
    { koodi: "11", osa: "" },
  ])("rejects duplicate normalized lisatieto key %#", (duplicate) => {
    const input = createInput();
    input.lisatiedotRows.push({
      ...input.lisatiedotRows[0],
      ...duplicate,
    });

    expect(parseAdminTrialEntryWriteInput(input, { mode: "create" })).toEqual({
      ok: false,
      issue: {
        area: "additional_info",
        reason: "duplicate_lisatieto_key",
      },
    });
  });

  it("allows the same lisatieto code with different osa values", () => {
    const input = createInput();
    input.lisatiedotRows.push({
      ...input.lisatiedotRows[0],
      osa: "2",
    });

    expect(
      parseAdminTrialEntryWriteInput(input, { mode: "create" }),
    ).toMatchObject({ ok: true });
  });

  it("rejects duplicate era values within one lisatieto row", () => {
    const input = createInput();
    input.lisatiedotRows[0].eraValues.push({ era: 1, arvo: "2" });

    expect(parseAdminTrialEntryWriteInput(input, { mode: "create" })).toEqual({
      ok: false,
      issue: {
        area: "additional_info",
        reason: "duplicate_lisatieto_era_value",
      },
    });
  });

  it("preserves update compatibility for invalid lisatieto ordering", () => {
    const input = createInput();
    input.lisatiedotRows[0].jarjestys = 1.5;

    expect(parseAdminTrialEntryWriteInput(input, { mode: "create" })).toEqual({
      ok: false,
      issue: {
        area: "additional_info",
        reason: "invalid_lisatieto_order",
      },
    });
    expect(
      parseAdminTrialEntryWriteInput(input, { mode: "update" }),
    ).toMatchObject({
      ok: true,
      data: {
        lisatiedotByEra: [{ items: [{ jarjestys: null }] }],
      },
    });
  });
});
