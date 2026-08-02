import type { LisatietoRowDraft } from "@/lib/admin/trials/entry-edit-dialog-model";

export type LisatiedotWorkspaceState = {
  expandedGroups: ReadonlySet<string>;
  activeRow: string | null;
  mobileSheetOpen: boolean;
};

export type LisatiedotWorkspaceAction =
  | { type: "toggleGroup"; value: string }
  | { type: "remove"; value: string }
  | { type: "active"; value: string | null; mobile?: boolean }
  | { type: "sheet"; value: boolean };

export const lisatietoRowKey = (
  row: Pick<LisatietoRowDraft, "koodi" | "osa">,
) => `${row.koodi}:${row.osa}`;

export function createLisatiedotWorkspaceState(): LisatiedotWorkspaceState {
  return {
    expandedGroups: new Set(),
    activeRow: null,
    mobileSheetOpen: false,
  };
}

export function lisatiedotWorkspaceReducer(
  state: LisatiedotWorkspaceState,
  action: LisatiedotWorkspaceAction,
): LisatiedotWorkspaceState {
  switch (action.type) {
    case "toggleGroup": {
      const expandedGroups = new Set(state.expandedGroups);
      if (expandedGroups.has(action.value)) expandedGroups.delete(action.value);
      else expandedGroups.add(action.value);
      return { ...state, expandedGroups };
    }
    case "remove": {
      return {
        ...state,
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
  }
}
