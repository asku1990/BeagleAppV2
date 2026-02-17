import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_LOCALE } from "@/lib/i18n/types";
import { readStoredLocale, writeStoredLocale } from "../storage";

type LocalStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

function installBrowserMocks(stored: Record<string, string> = {}) {
  const store = new Map(Object.entries(stored));
  const localStorage: LocalStorageLike = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage },
  });

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { cookie: "" },
  });

  return { store };
}

afterEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument,
  });
});

describe("i18n storage", () => {
  it("returns default locale when window is unavailable", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });

    expect(readStoredLocale()).toBe(DEFAULT_LOCALE);
  });

  it("returns stored locale when value is valid", () => {
    installBrowserMocks({ "beagle.locale": "sv" });

    expect(readStoredLocale()).toBe("sv");
  });

  it("falls back to default locale when stored value is invalid", () => {
    installBrowserMocks({ "beagle.locale": "invalid" });

    expect(readStoredLocale()).toBe(DEFAULT_LOCALE);
  });

  it("writes locale to localStorage and cookie", () => {
    const { store } = installBrowserMocks();

    writeStoredLocale("sv");

    expect(store.get("beagle.locale")).toBe("sv");
    expect(globalThis.document.cookie).toContain("beagle.locale=sv");
  });
});
