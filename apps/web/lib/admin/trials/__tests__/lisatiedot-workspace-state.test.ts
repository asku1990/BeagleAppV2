import { describe, expect, it } from "vitest";
import type { LisatietoRowDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import {
  createLisatiedotWorkspaceState,
  filterLisatietoRows,
  lisatiedotWorkspaceReducer,
} from "../lisatiedot-workspace-state";

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
    eraValues: { 1: "1" },
  },
  {
    koodi: "20",
    osa: "",
    nimi: "Haku",
    jarjestys: 20,
    group: "haku",
    label: "Haku",
    inputKind: "integer",
    sortOrder: 20,
    eraValues: { 1: "" },
  },
];

describe("lisatiedot workspace reducer", () => {
  it("rebuilds selection from draft values and resets all transient state", () => {
    let state = createLisatiedotWorkspaceState(rows);
    expect([...state.selectedRows]).toEqual(["10:"]);
    state = lisatiedotWorkspaceReducer(state, {
      type: "query",
      value: "haku",
    });
    state = lisatiedotWorkspaceReducer(state, {
      type: "active",
      value: "20:",
      mobile: true,
    });

    state = lisatiedotWorkspaceReducer(state, {
      type: "reset",
      rows: [rows[1]!],
    });

    expect(state).toEqual(createLisatiedotWorkspaceState([rows[1]!]));
  });

  it("keeps selection when only values are cleared and removes it explicitly", () => {
    let state = createLisatiedotWorkspaceState(rows);
    state = lisatiedotWorkspaceReducer(state, {
      type: "select",
      value: "20:",
    });
    expect(state.selectedRows.has("20:")).toBe(true);

    state = lisatiedotWorkspaceReducer(state, {
      type: "remove",
      value: "20:",
    });
    expect(state.selectedRows.has("20:")).toBe(false);
    expect(state.activeRow).toBeNull();
  });

  it("opens the same active row only when selection comes from mobile", () => {
    let state = createLisatiedotWorkspaceState(rows);
    state = lisatiedotWorkspaceReducer(state, {
      type: "active",
      value: "20:",
      mobile: false,
    });
    expect(state.activeRow).toBe("20:");
    expect(state.mobileSheetOpen).toBe(false);

    state = lisatiedotWorkspaceReducer(state, {
      type: "active",
      value: "20:",
      mobile: true,
    });
    expect(state.activeRow).toBe("20:");
    expect(state.mobileSheetOpen).toBe(true);

    state = lisatiedotWorkspaceReducer(state, {
      type: "sheet",
      value: false,
    });
    expect(state.mobileSheetOpen).toBe(false);
  });

  it("supports independent group expansion and expand/collapse all", () => {
    let state = createLisatiedotWorkspaceState(rows);
    state = lisatiedotWorkspaceReducer(state, {
      type: "expand",
      values: ["olosuhteet", "haku"],
    });
    expect([...state.expandedGroups]).toEqual(["olosuhteet", "haku"]);
    state = lisatiedotWorkspaceReducer(state, {
      type: "toggleGroup",
      value: "haku",
    });
    expect([...state.expandedGroups]).toEqual(["olosuhteet"]);
    state = lisatiedotWorkspaceReducer(state, { type: "collapse" });
    expect(state.expandedGroups.size).toBe(0);
  });

  it("searches localized names and codes within a business group", () => {
    expect(
      filterLisatietoRows(rows, "haku", "haku").map((row) => row.koodi),
    ).toEqual(["10", "20"]);
    expect(
      filterLisatietoRows(rows, "20", "haku").map((row) => row.koodi),
    ).toEqual(["10", "20"]);
  });

  it("keeps valued rows visible through search and group filters", () => {
    expect(
      filterLisatietoRows(rows, "not-found", "haku").map((row) => row.koodi),
    ).toEqual(["10"]);
  });
});
