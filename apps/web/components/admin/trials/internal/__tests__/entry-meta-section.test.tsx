import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { EntryDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import { resolveResultCreateFieldSet } from "@/lib/admin/trials/result-create-field-registry";
import { EntryMetaSection } from "../entry-meta-section";

const entryDraft: EntryDraft = {
  koemaasto: "Ristijärvi",
  koemuoto: "AJOK",
  koetyyppi: "NORMAL",
  ke: "P",
  lk: "VOI",
  award: "1",
  rank: "2",
  points: "98.5",
  koiriaLuokassa: "12",
  hyvaksytytAjominuutit: "120",
  ajoajanPisteet: "35",
  haku: "3.5",
  hauk: "7",
  yva: "4",
  hlo: "0",
  alo: "0",
  tja: "",
  pin: "5",
  ansiopisteetYhteensa: "36.75",
  tappiopisteetYhteensa: "0",
  judge: "Judge",
  huomautus: "",
  huomautusTeksti: "Huomautus",
  ylituomariNumeroSnapshot: "123",
  ryhmatuomariNimi: "Ryhmätuomari",
  palkintotuomariNimi: "Palkintotuomari",
  omistajaSnapshot: "Omistaja",
  omistajanKotikuntaSnapshot: "Lahti",
};

describe("EntryMetaSection", () => {
  it("renders PDF metadata and score fields", () => {
    const html = renderToStaticMarkup(
      React.createElement(EntryMetaSection, {
        entryDraft,
        isPending: false,
        onChange: vi.fn(),
      }),
    );

    expect(html).toContain("Kokeen ja koiran tiedot");
    expect(html).toContain("Koemaasto");
    expect(html).toContain("Paljas maa");
    expect(html).toContain("Lumikeli");
    expect(html).toContain("Omistaja");
    expect(html).toContain("Omistajan kotikunta");
    expect(html).toContain("Tulos ja huomautus");
    expect(html).toContain("Loppupisteet");
    expect(html).toContain("Huomautusteksti");
    expect(html).toContain("Ansiopisteet");
    expect(html).toContain("Tappiopisteet");
    expect(html).toContain("Hyväksytyt ajominuutit");
    expect(html).toContain("Ajo");
    expect(html).toContain("Haku");
    expect(html).toContain("Haukku");
    expect(html).toContain("Ajotaito / yleisvaikutelma");
    expect(html).toContain("Muut");
    expect(html.match(/<h5/g)).toHaveLength(4);
    expect(html).toContain("Ansiopisteet yhteensä");
    expect(html).toContain("Metsästysinto");
    expect(html).toContain("Tie ja estetyöskentely");
    expect(html).toContain("Hakulöysyys");
    expect(html).toContain("Ajolöysyys");
    expect(html).toContain("Tuomarit ja allekirjoitukset");
    expect(html).toContain("Ylituomarin numero");
    expect(html).toContain("Ryhmätuomari");
    expect(html).toContain("Palkintotuomari");
  });

  it("uses create-only field visibility without changing the default edit view", () => {
    const html = renderToStaticMarkup(
      React.createElement(EntryMetaSection, {
        entryDraft,
        isPending: false,
        onChange: vi.fn(),
        visibleFields:
          resolveResultCreateFieldSet("trw_post_20230801").entryFields,
        yvaLabel:
          resolveResultCreateFieldSet("trw_post_20230801").yvaLabels?.entry,
      }),
    );

    expect(html).not.toContain("Tie ja estetyöskentely");
    expect(html).not.toContain("Metsästysinto");
    expect(html).not.toContain("Ajotaito / yleisvaikutelma");
    expect(html.match(/<h5/g)).toHaveLength(4);
    expect(html).toContain(">Ajo</h5>");
    expect(html).toContain(">Haku</h5>");
    expect(html).toContain(">Haukku</h5>");
    expect(html).toContain(">Muut</h5>");
    expect(html).toContain("Ajotaito");
    expect(html).toContain("Ansiopisteet yhteensä");
  });

  it("renders only the requested presentation groups", () => {
    const html = renderToStaticMarkup(
      React.createElement(EntryMetaSection, {
        entryDraft,
        isPending: false,
        onChange: vi.fn(),
        groups: ["result", "judges"],
      }),
    );

    expect(html).toContain("Tulos ja huomautus");
    expect(html).toContain("Tuomarit ja allekirjoitukset");
    expect(html).not.toContain("Kokeen ja koiran tiedot");
    expect(html).not.toContain("Ansiopisteet");
    expect(html).not.toContain("Tappiopisteet");
  });

  it("moves weather into the create result group without changing edit defaults", () => {
    const fieldSet = resolveResultCreateFieldSet("trw_post_20230801");
    const groups = Object.fromEntries(
      fieldSet.presentationGroups.map((group) => [
        group.id,
        new Set(group.entryFields),
      ]),
    );
    const props = {
      entryDraft,
      isPending: false,
      onChange: vi.fn(),
      showHeadings: false,
    };
    const basicHtml = renderToStaticMarkup(
      React.createElement(EntryMetaSection, {
        ...props,
        groups: ["basic"],
        visibleFields: groups.basic,
      }),
    );
    const resultHtml = renderToStaticMarkup(
      React.createElement(EntryMetaSection, {
        ...props,
        groups: ["result"],
        visibleFields: groups.result,
      }),
    );

    expect(basicHtml).not.toContain("Keli");
    expect(resultHtml).toContain("Keli");
    expect(resultHtml).toContain("Huomautusteksti");
  });

  it("keeps the generic label and all fields in compatibility fallback", () => {
    const fieldSet = resolveResultCreateFieldSet(null);
    const html = renderToStaticMarkup(
      React.createElement(EntryMetaSection, {
        entryDraft,
        isPending: false,
        onChange: vi.fn(),
        visibleFields: fieldSet.entryFields,
        yvaLabel: fieldSet.yvaLabels?.entry,
      }),
    );

    expect(html).toContain("Ajotaito / yleisvaikutelma");
    expect(html).toContain("Tie ja estetyöskentely");
    expect(html).toContain("Metsästysinto");
  });
});
