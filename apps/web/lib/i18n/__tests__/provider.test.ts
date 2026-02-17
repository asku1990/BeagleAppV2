import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  useStateMock,
  useRefMock,
  useEffectMock,
  useMemoMock,
  writeStoredLocaleMock,
  readStoredLocaleMock,
} = vi.hoisted(() => ({
  useStateMock: vi.fn(),
  useRefMock: vi.fn(),
  useEffectMock: vi.fn(),
  useMemoMock: vi.fn(),
  writeStoredLocaleMock: vi.fn(),
  readStoredLocaleMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: useStateMock,
    useRef: useRefMock,
    useEffect: useEffectMock,
    useMemo: useMemoMock,
  };
});

vi.mock("@/lib/i18n/storage", () => ({
  readStoredLocale: readStoredLocaleMock,
  writeStoredLocale: writeStoredLocaleMock,
}));

import { I18nProvider } from "../provider";

describe("I18nProvider", () => {
  beforeEach(() => {
    useStateMock.mockReset();
    useRefMock.mockReset();
    useEffectMock.mockReset();
    useMemoMock.mockReset();
    writeStoredLocaleMock.mockReset();
    readStoredLocaleMock.mockReset();

    useMemoMock.mockImplementation((factory: () => unknown) => factory());
    useEffectMock.mockImplementation((effect: () => void | (() => void)) => {
      effect();
    });

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: { lang: "fi" },
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        requestAnimationFrame: (cb: () => void) => {
          cb();
          return 1;
        },
        cancelAnimationFrame: vi.fn(),
      },
    });
  });

  it("uses initial locale and writes it immediately", () => {
    const setLocale = vi.fn();
    useStateMock.mockReturnValue(["sv", setLocale]);
    useRefMock.mockReturnValue({ current: true });

    I18nProvider({ children: null, initialLocale: "sv" });

    expect(writeStoredLocaleMock).toHaveBeenCalledWith("sv");
    expect(globalThis.document.documentElement.lang).toBe("sv");
    expect(readStoredLocaleMock).not.toHaveBeenCalled();
  });

  it("loads stored locale when initial locale is missing", () => {
    const setLocale = vi.fn();
    useStateMock.mockReturnValue(["fi", setLocale]);
    useRefMock.mockReturnValue({ current: false });
    readStoredLocaleMock.mockReturnValue("sv");

    I18nProvider({ children: null });

    expect(readStoredLocaleMock).toHaveBeenCalled();
    expect(setLocale).toHaveBeenCalledWith("sv");
  });
});
