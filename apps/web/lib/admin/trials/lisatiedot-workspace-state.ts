import type { LisatietoRowDraft } from "@/lib/admin/trials/entry-edit-dialog-model";

export type LisatiedotWorkspaceState = {
  query: string;
  activeGroup: string | null;
  expandedGroups: ReadonlySet<string>;
  selectedRows: ReadonlySet<string>;
  activeRow: string | null;
  mobileSheetOpen: boolean;
};

export type LisatiedotWorkspaceAction =
  | { type: "query"; value: string }
  | { type: "group"; value: string | null }
  | { type: "toggleGroup"; value: string }
  | { type: "expand"; values: string[] }
  | { type: "collapse" }
  | { type: "select"; value: string }
  | { type: "remove"; value: string }
  | { type: "active"; value: string | null; mobile?: boolean }
  | { type: "sheet"; value: boolean }
  | { type: "reset"; rows: LisatietoRowDraft[] };

export const lisatietoRowKey = (
  row: Pick<LisatietoRowDraft, "koodi" | "osa">,
) => `${row.koodi}:${row.osa}`;

export function selectedLisatietoKeys(rows: LisatietoRowDraft[]) {
  return new Set(
    rows
      .filter((row) =>
        Object.values(row.eraValues).some((value) => value !== ""),
      )
      .map(lisatietoRowKey),
  );
}

export function filterLisatietoRows(
  rows: LisatietoRowDraft[],
  query: string,
  activeGroup: string | null,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return rows.filter((row) => {
    const hasValue = Object.values(row.eraValues).some((value) => value !== "");
    const matchesGroup = !activeGroup || row.group === activeGroup;
    const matchesQuery =
      !normalizedQuery ||
      `${row.koodi} ${row.osa} ${row.label}`
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    return hasValue || (matchesGroup && matchesQuery);
  });
}

export function createLisatiedotWorkspaceState(
  rows: LisatietoRowDraft[],
): LisatiedotWorkspaceState {
  return {
    query: "",
    activeGroup: null,
    expandedGroups: new Set(),
    selectedRows: selectedLisatietoKeys(rows),
    activeRow: null,
    mobileSheetOpen: false,
  };
}

export function lisatiedotWorkspaceReducer(
  state: LisatiedotWorkspaceState,
  action: LisatiedotWorkspaceAction,
): LisatiedotWorkspaceState {
  switch (action.type) {
    case "query":
      return { ...state, query: action.value };
    case "group":
      return { ...state, activeGroup: action.value };
    case "toggleGroup": {
      const expandedGroups = new Set(state.expandedGroups);
      if (expandedGroups.has(action.value)) expandedGroups.delete(action.value);
      else expandedGroups.add(action.value);
      return { ...state, expandedGroups };
    }
    case "expand":
      return { ...state, expandedGroups: new Set(action.values) };
    case "collapse":
      return { ...state, expandedGroups: new Set() };
    case "select":
      return {
        ...state,
        selectedRows: new Set([...state.selectedRows, action.value]),
        activeRow: action.value,
      };
    case "remove": {
      const selectedRows = new Set(state.selectedRows);
      selectedRows.delete(action.value);
      return {
        ...state,
        selectedRows,
        activeRow: state.activeRow === action.value ? null : state.activeRow,
        mobileSheetOpen:
          state.activeRow === action.value ? false : state.mobileSheetOpen,
      };
    }
    case "active":
      return {
        ...state,
        activeRow: action.value,
        mobileSheetOpen: action.mobile ?? state.mobileSheetOpen,
      };
    case "sheet":
      return { ...state, mobileSheetOpen: action.value };
    case "reset":
      return createLisatiedotWorkspaceState(action.rows);
  }
}
