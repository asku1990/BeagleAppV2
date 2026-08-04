import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useResultCreateWorkspaceMobile } from "../use-result-create-workspace-mobile";

const { hookState } = vi.hoisted(() => ({
  hookState: {
    index: 0,
    stateSlots: [] as unknown[],
    effectSlots: [] as Array<{ dependencies?: readonly unknown[] }>,
    cleanups: [] as Array<() => void>,
  },
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  const nextHookIndex = () => hookState.index++;

  function mockUseEffect(
    effect: () => void | (() => void),
    dependencies?: readonly unknown[],
  ) {
    const index = nextHookIndex();
    const previous = hookState.effectSlots[index];
    const unchanged =
      dependencies &&
      previous?.dependencies &&
      dependencies.length === previous.dependencies.length &&
      dependencies.every((value, position) =>
        Object.is(value, previous.dependencies?.[position]),
      );
    if (unchanged) return;

    const cleanup = effect();
    if (cleanup) hookState.cleanups.push(cleanup);
    hookState.effectSlots[index] = { dependencies };
  }

  function mockUseState<T>(initialValue: T) {
    const index = nextHookIndex();
    if (!(index in hookState.stateSlots))
      hookState.stateSlots[index] = initialValue;
    const setState = (value: T) => {
      hookState.stateSlots[index] = value;
    };
    return [hookState.stateSlots[index] as T, setState] as const;
  }

  return {
    ...actual,
    useEffect: mockUseEffect,
    useState: mockUseState,
  };
});

let matches = false;
let changeListener: (() => void) | undefined;

function HookHarness() {
  return useResultCreateWorkspaceMobile();
}

function renderHook() {
  hookState.index = 0;
  return HookHarness();
}

describe("useResultCreateWorkspaceMobile", () => {
  beforeEach(() => {
    matches = false;
    changeListener = undefined;
    hookState.index = 0;
    hookState.stateSlots = [];
    hookState.effectSlots = [];
    hookState.cleanups = [];
    vi.stubGlobal("window", {
      matchMedia: vi.fn(() => ({
        get matches() {
          return matches;
        },
        addEventListener: (_type: string, listener: () => void) => {
          changeListener = listener;
        },
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    hookState.cleanups.forEach((cleanup) => cleanup());
    vi.unstubAllGlobals();
  });

  it("matches the 1024px workspace breakpoint and updates on changes", () => {
    matches = true;

    renderHook();
    expect(renderHook()).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 1023px)");

    matches = false;
    changeListener?.();

    expect(renderHook()).toBe(false);
  });

  it("starts in desktop mode", () => {
    expect(renderHook()).toBe(false);
  });
});
