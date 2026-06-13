import React, { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VirtualPairingDogOption } from "@beagle/contracts";
import { useBeagleVirtualPairingUiState } from "../use-beagle-virtual-pairing-ui-state";

const {
  calculateMutationMock,
  hookState,
  pathnameMock,
  replaceMock,
  searchParamsState,
  searchQueryMock,
} = vi.hoisted(() => ({
  calculateMutationMock: vi.fn(),
  hookState: {
    index: 0,
    stateSlots: [] as unknown[],
    refSlots: [] as Array<{ current: unknown }>,
  },
  pathnameMock: "/beagle/virtual-pairing",
  replaceMock: vi.fn(),
  searchParamsState: {
    sire: "",
    dam: "",
    sp: "",
  },
  searchQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => ({
    get: (key: string) => {
      const value =
        key === "sire"
          ? searchParamsState.sire
          : key === "dam"
            ? searchParamsState.dam
            : key === "sp"
              ? searchParamsState.sp
              : "";
      return value ? value : null;
    },
  }),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  const nextHookIndex = () => hookState.index++;
  function mockUseCallback<T extends (...args: never[]) => unknown>(fn: T) {
    nextHookIndex();
    return fn;
  }

  function mockUseEffect(effect: () => void | (() => void)) {
    nextHookIndex();
    effect();
  }

  function mockUseMemo<T>(factory: () => T) {
    nextHookIndex();
    return factory();
  }

  function mockUseRef<T>(initialValue: T) {
    const index = nextHookIndex();
    if (!(index in hookState.refSlots)) {
      hookState.refSlots[index] = { current: initialValue };
    }

    return hookState.refSlots[index] as { current: T };
  }

  function mockUseState<T>(initialValue: T) {
    const index = nextHookIndex();
    if (!(index in hookState.stateSlots)) {
      hookState.stateSlots[index] = initialValue;
    }

    const setState = (value: T | ((current: T) => T)) => {
      hookState.stateSlots[index] =
        typeof value === "function"
          ? (value as (current: T) => T)(hookState.stateSlots[index] as T)
          : value;
    };

    return [hookState.stateSlots[index] as T, setState] as const;
  }

  return {
    ...actual,
    useCallback: mockUseCallback,
    useEffect: mockUseEffect,
    useMemo: mockUseMemo,
    useRef: mockUseRef,
    useState: mockUseState,
  };
});

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/queries/public/beagle/dogs/virtual-pairing", () => ({
  usePublicVirtualPairingSearchQuery: searchQueryMock,
  useCalculatePublicVirtualPairingMutation: calculateMutationMock,
}));

type HookResult = {
  calculationResult: { generationDepth: number } | null;
  selectedSire: VirtualPairingDogOption | null;
  selectedDam: VirtualPairingDogOption | null;
  generationDepth: string;
  onSelectSire: (candidate: VirtualPairingDogOption) => void;
  onSelectDam: (candidate: VirtualPairingDogOption) => void;
  onGenerationDepthChange: (value: string) => void;
};

function resetHooks() {
  hookState.index = 0;
  hookState.stateSlots = [];
  hookState.refSlots = [];
}

let latestHookResult: HookResult | null = null;

function renderHookHarness(): HookResult | null {
  hookState.index = 0;
  function Harness() {
    const hookResult = useBeagleVirtualPairingUiState();

    useEffect(() => {
      latestHookResult = hookResult;
    }, [hookResult]);

    return React.createElement("div", null, "ok");
  }

  renderToStaticMarkup(React.createElement(Harness));
  return latestHookResult;
}

async function flushMicrotasks() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe("useBeagleVirtualPairingUiState", () => {
  beforeEach(() => {
    resetHooks();
    latestHookResult = null;
    replaceMock.mockReset();
    calculateMutationMock.mockReset();
    searchQueryMock.mockReset();
    searchParamsState.sire = "";
    searchParamsState.dam = "";
    searchParamsState.sp = "";

    searchQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });
  });

  it("auto-loads a URL-backed calculation once and syncs the result into the URL", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      generationDepth: 12,
      sire: {
        id: "sire-1",
        ekNo: null,
        registrationNo: "FIN18665/07",
        name: "Sire Dog",
        sex: "U",
      },
      dam: {
        id: "dam-1",
        ekNo: null,
        registrationNo: "FIN12562/97",
        name: "Dam Dog",
        sex: "N",
      },
      inbreedingCoefficientPct: 12.3456,
      rawInbreedingCoefficientPct: 12.3456,
      health: {
        epi: {
          value: 0,
          text: "-----",
          tier: 1,
          display: "0.000 -----",
        },
        risk: {
          value: 4,
          display: "4",
        },
      },
      summary: {
        sharedAncestorCount: 1,
        sharedOccurrenceCount: 2,
        includedOccurrenceCount: 3,
        includedSirePositionCount: 4,
        includedDamPositionCount: 5,
        includedPositionCount: 6,
        knownPedigreePct: 88.5,
        contributions: [],
      },
    });

    calculateMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    searchParamsState.sire = "FIN18665/07";
    searchParamsState.dam = "FIN12562/97";
    searchParamsState.sp = "12";

    const firstHook = renderHookHarness();
    expect(firstHook).not.toBeNull();
    expect(firstHook!.calculationResult).toBeNull();

    await flushMicrotasks();

    const secondHook = renderHookHarness();

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith({
      sireRegistrationNo: "FIN18665/07",
      damRegistrationNo: "FIN12562/97",
      generationDepth: 12,
    });
    expect(secondHook).not.toBeNull();
    expect(secondHook!.selectedSire).toMatchObject({ name: "Sire Dog" });
    expect(secondHook!.selectedDam).toMatchObject({ name: "Dam Dog" });
    expect(secondHook!.generationDepth).toBe("12");
    expect(replaceMock).toHaveBeenCalledWith(
      "/beagle/virtual-pairing?sire=FIN18665%2F07&dam=FIN12562%2F97&sp=12",
    );
  });

  it("keeps the selected pair when generation depth changes", async () => {
    calculateMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });

    const sire: VirtualPairingDogOption = {
      id: "sire-1",
      ekNo: null,
      registrationNo: "FIN18665/07",
      name: "Sire Dog",
      sex: "U",
    };
    const dam: VirtualPairingDogOption = {
      id: "dam-1",
      ekNo: null,
      registrationNo: "FIN12562/97",
      name: "Dam Dog",
      sex: "N",
    };

    renderHookHarness();
    latestHookResult?.onSelectSire(sire);
    latestHookResult?.onSelectDam(dam);

    let hook = renderHookHarness();
    expect(hook).not.toBeNull();
    expect(hook!.selectedSire).toMatchObject({ name: "Sire Dog" });
    expect(hook!.selectedDam).toMatchObject({ name: "Dam Dog" });
    expect(hook!.generationDepth).toBe("9");

    const replaceCallsAfterSelection = replaceMock.mock.calls.length;
    latestHookResult?.onGenerationDepthChange("12");

    hook = renderHookHarness();
    expect(hook).not.toBeNull();
    expect(hook!.selectedSire).toMatchObject({ name: "Sire Dog" });
    expect(hook!.selectedDam).toMatchObject({ name: "Dam Dog" });
    expect(hook!.generationDepth).toBe("12");
    expect(hook!.calculationResult).toBeNull();
    expect(replaceMock.mock.calls.length).toBe(replaceCallsAfterSelection);
  });

  it("clears stale URL-backed state when the query string becomes incomplete", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      generationDepth: 9,
      sire: {
        id: "sire-1",
        ekNo: null,
        registrationNo: "FIN18665/07",
        name: "Sire Dog",
        sex: "U",
      },
      dam: {
        id: "dam-1",
        ekNo: null,
        registrationNo: "FIN12562/97",
        name: "Dam Dog",
        sex: "N",
      },
      inbreedingCoefficientPct: 1.2345,
      rawInbreedingCoefficientPct: 1.2345,
      health: {
        epi: {
          value: 0,
          text: "-----",
          tier: 1,
          display: "0.000 -----",
        },
        risk: {
          value: 4,
          display: "4",
        },
      },
      summary: {
        sharedAncestorCount: 0,
        sharedOccurrenceCount: 0,
        includedOccurrenceCount: 0,
        includedSirePositionCount: 0,
        includedDamPositionCount: 0,
        includedPositionCount: 0,
        knownPedigreePct: 0,
        contributions: [],
      },
    });

    calculateMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    searchParamsState.sire = "FIN18665/07";
    searchParamsState.dam = "FIN12562/97";
    searchParamsState.sp = "9";

    renderHookHarness();
    await flushMicrotasks();
    renderHookHarness();

    searchParamsState.sire = "FIN18665/07";
    searchParamsState.dam = "";
    searchParamsState.sp = "";

    renderHookHarness();
    await flushMicrotasks();
    const afterReset = renderHookHarness();

    expect(afterReset).not.toBeNull();
    expect(afterReset!.selectedSire).toBeNull();
    expect(afterReset!.selectedDam).toBeNull();
    expect(afterReset!.generationDepth).toBe("9");
  });
});
