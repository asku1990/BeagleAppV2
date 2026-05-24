import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VirtualPairingDogOption } from "@beagle/contracts";

const {
  calculateMutationMock,
  hookState,
  pathnameMock,
  replaceMock,
  searchParamsState,
  searchPanelPropsRef,
  selectionPanelPropsRef,
  searchQueryMock,
} = vi.hoisted(() => ({
  calculateMutationMock: vi.fn(),
  hookState: {
    index: 0,
    stateSlots: [] as unknown[],
    refSlots: [] as Array<{ current: unknown }>,
  },
  pathnameMock: "/admin/dogs/virtual-pairing",
  replaceMock: vi.fn(),
  searchParamsState: {
    sire: "",
    dam: "",
    sp: "",
  },
  searchPanelPropsRef: { current: null as Record<string, unknown> | null },
  selectionPanelPropsRef: {
    current: null as Record<string, unknown> | null,
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

vi.mock("@/queries/admin/dogs", () => ({
  useAdminVirtualPairingSearchQuery: searchQueryMock,
  useCalculateAdminVirtualPairingMutation: calculateMutationMock,
}));

vi.mock("../internal/virtual-pairing-search-panel", () => ({
  AdminVirtualPairingSearchPanel: (props: Record<string, unknown>) => {
    searchPanelPropsRef.current = props;
    return React.createElement("div", {
      "data-slot": "search-panel",
    });
  },
}));

vi.mock("../internal/virtual-pairing-selection-panel", () => ({
  AdminVirtualPairingSelectionPanel: (props: Record<string, unknown>) => {
    selectionPanelPropsRef.current = props;
    return React.createElement("div", {
      "data-slot": "selection-panel",
    });
  },
}));

import { AdminVirtualPairingPageClient } from "../admin-virtual-pairing-page-client";

function resetHooks() {
  hookState.index = 0;
  hookState.stateSlots = [];
  hookState.refSlots = [];
}

function renderClient() {
  hookState.index = 0;
  return renderToStaticMarkup(
    React.createElement(AdminVirtualPairingPageClient),
  );
}

async function flushMicrotasks() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe("AdminVirtualPairingPageClient", () => {
  beforeEach(() => {
    resetHooks();
    replaceMock.mockReset();
    calculateMutationMock.mockReset();
    searchQueryMock.mockReset();
    searchPanelPropsRef.current = null;
    selectionPanelPropsRef.current = null;
    searchParamsState.sire = "";
    searchParamsState.dam = "";
    searchParamsState.sp = "";

    searchQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("auto-loads a URL-backed calculation once for SP 12", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      generationDepth: 12,
      sire: {
        id: "sire-1",
        ekNo: null,
        registrationNo: "FIN18665/07",
        name: "Sire Dog",
        sex: "U",
      } satisfies VirtualPairingDogOption,
      dam: {
        id: "dam-1",
        ekNo: null,
        registrationNo: "FIN12562/97",
        name: "Dam Dog",
        sex: "N",
      } satisfies VirtualPairingDogOption,
      inbreedingCoefficientPct: 12.3456,
      diagnostics: {
        sharedAncestorCount: 1,
        sharedOccurrenceCount: 2,
        includedOccurrenceCount: 3,
        includedSirePositionCount: 4,
        includedDamPositionCount: 5,
        includedPositionCount: 6,
        knownSlotCount: 7,
        knownPedigreePct: 88.5,
        contributions: [],
      },
      placeholders: {
        epi: { label: "EPI", value: "Soon" },
        lafora: { label: "Lafora", value: "Soon" },
        pur: { label: "Pur", value: "Soon" },
        risk: { label: "Risk", value: "Soon" },
        diagnostics: { label: "Diagnostics", value: "Soon" },
        pedigree: { label: "Pedigree", value: "Soon" },
      },
    });

    calculateMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    searchParamsState.sire = "FIN18665/07";
    searchParamsState.dam = "FIN12562/97";
    searchParamsState.sp = "12";

    const firstHtml = renderClient();
    expect(firstHtml).toContain("admin.virtualPairing.result.empty");
    expect(searchPanelPropsRef.current?.searchField).toBe("name");

    await flushMicrotasks();

    const secondHtml = renderClient();

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith({
      sireRegistrationNo: "FIN18665/07",
      damRegistrationNo: "FIN12562/97",
      generationDepth: 12,
    });
    expect(secondHtml).toContain("Sire Dog / Dam Dog");
    expect(secondHtml).toContain("SP 12");
    expect(secondHtml).toContain("12.3456 %");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("writes sire, dam, and sp to the URL after a successful manual calculation", async () => {
    const mutateAsync = vi.fn().mockResolvedValueOnce({
      generationDepth: 7,
      sire: {
        id: "sire-1",
        ekNo: null,
        registrationNo: "FIN18665/07",
        name: "Sire Dog",
        sex: "U",
      } satisfies VirtualPairingDogOption,
      dam: {
        id: "dam-1",
        ekNo: null,
        registrationNo: "FIN12562/97",
        name: "Dam Dog",
        sex: "N",
      } satisfies VirtualPairingDogOption,
      inbreedingCoefficientPct: 1.2345,
      diagnostics: {
        sharedAncestorCount: 0,
        sharedOccurrenceCount: 0,
        includedOccurrenceCount: 0,
        includedSirePositionCount: 0,
        includedDamPositionCount: 0,
        includedPositionCount: 0,
        knownSlotCount: 0,
        knownPedigreePct: 0,
        contributions: [],
      },
      placeholders: {
        epi: { label: "EPI", value: "Soon" },
        lafora: { label: "Lafora", value: "Soon" },
        pur: { label: "Pur", value: "Soon" },
        risk: { label: "Risk", value: "Soon" },
        diagnostics: { label: "Diagnostics", value: "Soon" },
        pedigree: { label: "Pedigree", value: "Soon" },
      },
    });

    calculateMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });

    const sireCandidate = {
      id: "candidate-sire",
      ekNo: null,
      registrationNo: "FIN18665/07",
      name: "Sire Dog",
      sex: "U",
    } satisfies VirtualPairingDogOption;
    const damCandidate = {
      id: "candidate-dam",
      ekNo: null,
      registrationNo: "FIN12562/97",
      name: "Dam Dog",
      sex: "N",
    } satisfies VirtualPairingDogOption;

    renderClient();

    (
      searchPanelPropsRef.current?.onSelectParent as (
        candidate: VirtualPairingDogOption,
        target: "sire" | "dam",
      ) => void
    )(sireCandidate, "sire");
    (
      searchPanelPropsRef.current?.onSelectParent as (
        candidate: VirtualPairingDogOption,
        target: "sire" | "dam",
      ) => void
    )(damCandidate, "dam");

    (
      selectionPanelPropsRef.current?.onGenerationDepthChange as (
        value: string,
      ) => void
    )("7");

    renderClient();

    await (
      selectionPanelPropsRef.current?.onCalculate as () => Promise<void>
    )();
    await flushMicrotasks();
    const finalHtml = renderClient();

    expect(mutateAsync).toHaveBeenCalledWith({
      sireRegistrationNo: "FIN18665/07",
      damRegistrationNo: "FIN12562/97",
      generationDepth: 7,
    });
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith(
      "/admin/dogs/virtual-pairing?sire=FIN18665%2F07&dam=FIN12562%2F97&sp=7",
      { scroll: false },
    );
    expect(finalHtml).toContain("Sire Dog / Dam Dog");
    expect(finalHtml).toContain("SP 7");
  });

  it("clears the displayed result when selections change without rewriting the URL", async () => {
    const mutateAsync = vi.fn().mockResolvedValueOnce({
      generationDepth: 9,
      sire: {
        id: "sire-1",
        ekNo: null,
        registrationNo: "FIN18665/07",
        name: "Sire Dog",
        sex: "U",
      } satisfies VirtualPairingDogOption,
      dam: {
        id: "dam-1",
        ekNo: null,
        registrationNo: "FIN12562/97",
        name: "Dam Dog",
        sex: "N",
      } satisfies VirtualPairingDogOption,
      inbreedingCoefficientPct: 1.2345,
      diagnostics: {
        sharedAncestorCount: 0,
        sharedOccurrenceCount: 0,
        includedOccurrenceCount: 0,
        includedSirePositionCount: 0,
        includedDamPositionCount: 0,
        includedPositionCount: 0,
        knownSlotCount: 0,
        knownPedigreePct: 0,
        contributions: [],
      },
      placeholders: {
        epi: { label: "EPI", value: "Soon" },
        lafora: { label: "Lafora", value: "Soon" },
        pur: { label: "Pur", value: "Soon" },
        risk: { label: "Risk", value: "Soon" },
        diagnostics: { label: "Diagnostics", value: "Soon" },
        pedigree: { label: "Pedigree", value: "Soon" },
      },
    });

    calculateMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });

    const sireCandidate = {
      id: "candidate-sire",
      ekNo: null,
      registrationNo: "FIN18665/07",
      name: "Sire Dog",
      sex: "U",
    } satisfies VirtualPairingDogOption;
    const damCandidate = {
      id: "candidate-dam",
      ekNo: null,
      registrationNo: "FIN12562/97",
      name: "Dam Dog",
      sex: "N",
    } satisfies VirtualPairingDogOption;

    renderClient();

    (
      searchPanelPropsRef.current?.onSelectParent as (
        candidate: VirtualPairingDogOption,
        target: "sire" | "dam",
      ) => void
    )(sireCandidate, "sire");
    (
      searchPanelPropsRef.current?.onSelectParent as (
        candidate: VirtualPairingDogOption,
        target: "sire" | "dam",
      ) => void
    )(damCandidate, "dam");

    renderClient();

    await (
      selectionPanelPropsRef.current?.onCalculate as () => Promise<void>
    )();
    await flushMicrotasks();

    (
      selectionPanelPropsRef.current?.onGenerationDepthChange as (
        value: string,
      ) => void
    )("8");

    renderClient();

    const afterChangeHtml = renderClient();

    expect(afterChangeHtml).toContain("admin.virtualPairing.result.empty");
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });

  it("shows the existing calculation error message when auto-load fails", async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(new Error("Calculation failed."));

    calculateMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    searchParamsState.sire = "FIN18665/07";
    searchParamsState.dam = "FIN12562/97";
    searchParamsState.sp = "9";

    renderClient();
    await flushMicrotasks();

    renderClient();

    expect(selectionPanelPropsRef.current?.calculationMessage).toBe(
      "Calculation failed.",
    );
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });
});
