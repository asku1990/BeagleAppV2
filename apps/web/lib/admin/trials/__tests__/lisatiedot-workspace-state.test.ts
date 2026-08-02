import { describe, expect, it } from "vitest";
import {
  createLisatiedotWorkspaceState,
  lisatiedotWorkspaceReducer,
} from "../lisatiedot-workspace-state";

describe("lisatiedot workspace reducer", () => {
  it("resets all transient workspace state", () => {
    let state = lisatiedotWorkspaceReducer(createLisatiedotWorkspaceState(), {
      type: "toggleGroup",
      value: "haku",
    });
    state = lisatiedotWorkspaceReducer(state, {
      type: "active",
      value: "20:",
      mobile: true,
    });

    state = lisatiedotWorkspaceReducer(state, { type: "reset" });

    expect(state).toEqual(createLisatiedotWorkspaceState());
  });

  it("clears the active row when it is removed", () => {
    let state = lisatiedotWorkspaceReducer(createLisatiedotWorkspaceState(), {
      type: "active",
      value: "20:",
      mobile: true,
    });
    state = lisatiedotWorkspaceReducer(state, {
      type: "remove",
      value: "20:",
    });

    expect(state.activeRow).toBeNull();
    expect(state.mobileSheetOpen).toBe(false);
  });

  it("supports independent group expansion", () => {
    let state = createLisatiedotWorkspaceState();
    state = lisatiedotWorkspaceReducer(state, {
      type: "toggleGroup",
      value: "olosuhteet",
    });
    state = lisatiedotWorkspaceReducer(state, {
      type: "toggleGroup",
      value: "haku",
    });

    expect([...state.expandedGroups]).toEqual(["olosuhteet", "haku"]);
  });

  it("shares row activation behavior between desktop and mobile", () => {
    let state = lisatiedotWorkspaceReducer(createLisatiedotWorkspaceState(), {
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
});
