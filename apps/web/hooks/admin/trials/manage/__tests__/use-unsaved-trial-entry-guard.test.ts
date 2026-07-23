import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUnsavedTrialEntryGuard } from "../use-unsaved-trial-entry-guard";

const { hookState } = vi.hoisted(() => ({
  hookState: {
    index: 0,
    stateSlots: [] as unknown[],
    refSlots: [] as Array<{ current: unknown }>,
    effectSlots: [] as Array<{
      cleanup?: () => void;
      dependencies?: readonly unknown[];
    }>,
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

    previous?.cleanup?.();
    const cleanup = effect();
    hookState.effectSlots[index] = {
      cleanup: cleanup ?? undefined,
      dependencies,
    };
  }

  function mockUseRef<T>(initialValue: T) {
    const index = nextHookIndex();
    if (!(index in hookState.refSlots))
      hookState.refSlots[index] = { current: initialValue };
    return hookState.refSlots[index] as { current: T };
  }

  function mockUseState<T>(initialValue: T) {
    const index = nextHookIndex();
    if (!(index in hookState.stateSlots))
      hookState.stateSlots[index] = initialValue;
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
    useEffect: mockUseEffect,
    useRef: mockUseRef,
    useState: mockUseState,
  };
});

type BrowserListeners = {
  beforeunload?: (event: BeforeUnloadEvent) => void;
  click?: (event: MouseEvent) => void;
};

type Guard = ReturnType<typeof useUnsavedTrialEntryGuard>;

const listeners: BrowserListeners = {};
const assignMock = vi.fn();
const historyBackMock = vi.fn();
const historyForwardMock = vi.fn();
const windowAddEventListenerMock = vi.fn(
  (type: string, listener: EventListenerOrEventListenerObject) => {
    if (type === "beforeunload")
      listeners.beforeunload = listener as BrowserListeners["beforeunload"];
  },
);
const windowRemoveEventListenerMock = vi.fn();
const documentAddEventListenerMock = vi.fn(
  (type: string, listener: EventListenerOrEventListenerObject) => {
    if (type === "click")
      listeners.click = listener as BrowserListeners["click"];
  },
);
const documentRemoveEventListenerMock = vi.fn();

let latestGuard: Guard | null = null;

function GuardHarness({ isDirty }: { isDirty: boolean }) {
  const guard = useUnsavedTrialEntryGuard(isDirty);
  useEffect(() => {
    latestGuard = guard;
  }, [guard]);
  return null;
}

function renderGuard(isDirty: boolean): Guard {
  hookState.index = 0;
  GuardHarness({ isDirty });
  return latestGuard!;
}

function createClick({
  href = "http://localhost/admin/trials/event-1",
  target = "",
  download = false,
  metaKey = false,
  ctrlKey = false,
  shiftKey = false,
  altKey = false,
}: {
  href?: string;
  target?: string;
  download?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
} = {}) {
  const preventDefault = vi.fn();
  const anchor = {
    href,
    target,
    hasAttribute: (name: string) => name === "download" && download,
  };
  const event = {
    altKey,
    button: 0,
    ctrlKey,
    defaultPrevented: false,
    metaKey,
    preventDefault,
    shiftKey,
    target: { closest: () => anchor },
  } as unknown as MouseEvent;
  return { event, preventDefault };
}

describe("useUnsavedTrialEntryGuard", () => {
  beforeEach(() => {
    hookState.index = 0;
    hookState.stateSlots = [];
    hookState.refSlots = [];
    hookState.effectSlots = [];
    latestGuard = null;
    Object.keys(listeners).forEach(
      (key) => delete listeners[key as keyof BrowserListeners],
    );
    assignMock.mockReset();
    historyBackMock.mockReset();
    historyForwardMock.mockReset();
    windowAddEventListenerMock.mockClear();
    windowRemoveEventListenerMock.mockClear();
    documentAddEventListenerMock.mockClear();
    documentRemoveEventListenerMock.mockClear();
    vi.stubGlobal("window", {
      addEventListener: windowAddEventListenerMock,
      removeEventListener: windowRemoveEventListenerMock,
      history: {
        back: historyBackMock,
        forward: historyForwardMock,
      },
      location: {
        assign: assignMock,
        href: "http://localhost/admin/trials/event-1/results/new",
        origin: "http://localhost",
      },
    });
    vi.stubGlobal("document", {
      addEventListener: documentAddEventListenerMock,
      removeEventListener: documentRemoveEventListenerMock,
    });
  });

  afterEach(() => {
    for (const effect of hookState.effectSlots) effect?.cleanup?.();
    vi.unstubAllGlobals();
  });

  it("runs clean leave requests immediately", () => {
    const action = vi.fn();

    const guard = renderGuard(false);
    guard.requestLeave(action);

    expect(action).toHaveBeenCalledOnce();
    expect(guard.isConfirmingLeave).toBe(false);
  });

  it("keeps dirty requests pending until confirmed and runs them once", () => {
    const action = vi.fn();

    renderGuard(true).requestLeave(action);
    const pendingGuard = renderGuard(true);

    expect(pendingGuard.isConfirmingLeave).toBe(true);
    expect(action).not.toHaveBeenCalled();

    pendingGuard.confirmLeave();
    pendingGuard.confirmLeave();

    expect(action).toHaveBeenCalledOnce();
    expect(renderGuard(true).isConfirmingLeave).toBe(false);
  });

  it("cancels a dirty leave without running its action", () => {
    const action = vi.fn();

    renderGuard(true).requestLeave(action);
    const pendingGuard = renderGuard(true);
    pendingGuard.cancelLeave();

    expect(action).not.toHaveBeenCalled();
    expect(renderGuard(true).isConfirmingLeave).toBe(false);
  });

  it("blocks unload while dirty without installing popstate handling", () => {
    renderGuard(true);
    const event = {
      preventDefault: vi.fn(),
      returnValue: false,
    } as unknown as BeforeUnloadEvent;

    listeners.beforeunload?.(event);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.returnValue).toBe(true);
    expect(windowAddEventListenerMock).not.toHaveBeenCalledWith(
      "popstate",
      expect.anything(),
    );
    expect(historyBackMock).not.toHaveBeenCalled();
    expect(historyForwardMock).not.toHaveBeenCalled();
  });

  it("does not install browser guards while clean", () => {
    renderGuard(false);

    expect(windowAddEventListenerMock).not.toHaveBeenCalled();
    expect(documentAddEventListenerMock).not.toHaveBeenCalled();
  });

  it("confirms an intercepted same-tab link and opens the intended URL", () => {
    renderGuard(true);
    const { event, preventDefault } = createClick({ target: "_self" });

    listeners.click?.(event);
    const pendingGuard = renderGuard(true);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(pendingGuard.isConfirmingLeave).toBe(true);

    pendingGuard.confirmLeave();

    expect(assignMock).toHaveBeenCalledOnce();
    expect(assignMock).toHaveBeenCalledWith(
      "http://localhost/admin/trials/event-1",
    );
  });

  it.each([
    { name: "Cmd-click", options: { metaKey: true } },
    { name: "Ctrl-click", options: { ctrlKey: true } },
    { name: "Shift-click", options: { shiftKey: true } },
    { name: "Alt-click", options: { altKey: true } },
    { name: "new-tab target", options: { target: "_blank" } },
    { name: "download", options: { download: true } },
    {
      name: "external URL",
      options: { href: "https://example.com/somewhere" },
    },
    {
      name: "current URL",
      options: {
        href: "http://localhost/admin/trials/event-1/results/new",
      },
    },
  ])("does not intercept $name", ({ options }) => {
    renderGuard(true);
    const { event, preventDefault } = createClick(options);

    listeners.click?.(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(renderGuard(true).isConfirmingLeave).toBe(false);
  });
});
