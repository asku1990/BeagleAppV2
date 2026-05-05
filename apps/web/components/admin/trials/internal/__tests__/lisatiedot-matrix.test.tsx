import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  createEmptyEraDraft,
  type LisatietoRowDraft,
} from "@/lib/admin/trials/entry-edit-dialog-model";
import { LisatiedotMatrix } from "../lisatiedot-matrix";

describe("LisatiedotMatrix", () => {
  it("renders grouped lisatiedot with code, osa, and label", () => {
    const rows: LisatietoRowDraft[] = [
      {
        koodi: "10",
        osa: "",
        nimi: "Vaativat olosuhteet",
        jarjestys: 10,
        group: "olosuhteet",
        label: "Vaativat olosuhteet",
        inputKind: "marker",
        sortOrder: 10,
        eraValues: { 1: "1", 2: "" },
      },
      {
        koodi: "19",
        osa: "",
        nimi: "Lumipeitteen laatu",
        jarjestys: 19,
        group: "olosuhteet",
        label: "Lumipeitteen laatu",
        inputKind: "text",
        sortOrder: 19,
        eraValues: { 1: "5", 2: "" },
      },
      {
        koodi: "25",
        osa: "a",
        nimi: "Yöjälki löytyi",
        jarjestys: 25,
        group: "haku",
        label: "Yöjälki löytyi",
        inputKind: "decimal",
        sortOrder: 25,
        eraValues: { 1: "0.3", 2: "" },
      },
      {
        koodi: "90",
        osa: "legacy",
        nimi: "Legacy field",
        jarjestys: 900,
        group: "unknown",
        label: "Legacy field",
        inputKind: "text",
        sortOrder: 90,
        eraValues: { 1: "free", 2: "" },
      },
    ];

    const html = renderToStaticMarkup(
      React.createElement(LisatiedotMatrix, {
        eras: [createEmptyEraDraft(1), createEmptyEraDraft(2)],
        rows,
        isPending: false,
        onChangeCell: vi.fn(),
      }),
    );

    expect(html).toContain("Olosuhteet");
    expect(html).toContain("Haku");
    expect(html).toContain("Muut / tuntemattomat");
    expect(html).toContain("25 a");
    expect(html).toContain("Yöjälki löytyi");
    expect(html).toContain("90 legacy");
    expect(html).toContain("Legacy field");
    expect(html).toContain('inputMode="text"');
  });
});
