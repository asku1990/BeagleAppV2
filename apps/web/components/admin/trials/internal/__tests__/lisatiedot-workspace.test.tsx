import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createEmptyEraDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import type { LisatietoRowDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import type { LisatiedotWorkspaceState } from "@/lib/admin/trials/lisatiedot-workspace-state";
import { LisatiedotWorkspace } from "../lisatiedot-workspace";

const groups = [
  "olosuhteet",
  "haku",
  "haukku",
  "metsastysinto",
  "ajo",
  "muut_ominaisuudet",
  "unknown",
] as const;

function row(group: LisatietoRowDraft["group"], code: string) {
  return {
    koodi: code,
    osa: "",
    nimi: code,
    jarjestys: Number(code),
    group,
    label: `${group} ${code}`,
    inputKind: "text" as const,
    sortOrder: Number(code),
    eraValues: { 1: "" },
  } satisfies LisatietoRowDraft;
}

describe("LisatiedotWorkspace", () => {
  it("renders PDF-domain groups in order as individually collapsible sections", () => {
    const rows = groups
      .slice()
      .reverse()
      .map((group, index) => row(group, String(index + 10)));
    const html = renderToStaticMarkup(
      <LisatiedotWorkspace
        eras={[createEmptyEraDraft(1)]}
        rows={rows}
        isPending={false}
        onChangeCell={vi.fn()}
        onRemoveRow={vi.fn()}
      />,
    );

    const labels = [
      "Olosuhteet",
      "Haku",
      "Haukku",
      "Metsästysinto",
      "Ajo",
      "Muut ominaisuudet",
      "Muut / tuntemattomat",
    ];
    const positions = labels.map((label) => html.indexOf(label));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual(
      [...positions].sort((left, right) => left - right),
    );
    expect(html.match(/aria-expanded="false"/g) ?? []).toHaveLength(7);
  });

  it("renders the active row editor with an accessible remove label", () => {
    const state: LisatiedotWorkspaceState = {
      expandedGroups: new Set(["haku"]),
      activeRow: "20:",
      mobileSheetOpen: false,
    };
    const reducerSpy = vi
      .spyOn(React, "useReducer")
      .mockReturnValue([state, vi.fn()] as never);

    try {
      const html = renderToStaticMarkup(
        <LisatiedotWorkspace
          eras={[createEmptyEraDraft(1)]}
          rows={[row("haku", "20")]}
          isPending={false}
          onChangeCell={vi.fn()}
          onRemoveRow={vi.fn()}
        />,
      );

      expect(html).toContain('aria-label="Poista 20 haku 20"');
    } finally {
      reducerSpy.mockRestore();
    }
  });
});
