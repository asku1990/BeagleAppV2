import { beforeEach, describe, expect, it, vi } from "vitest";

const { useContextMock } = vi.hoisted(() => ({
  useContextMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<object>("react");
  return {
    ...actual,
    useContext: useContextMock,
  };
});

import { useI18n } from "../use-i18n";

describe("useI18n", () => {
  beforeEach(() => {
    useContextMock.mockReset();
  });

  it("returns i18n context when provider is available", () => {
    const context = {
      locale: "fi",
      setLocale: vi.fn(),
      t: vi.fn().mockReturnValue("ok"),
    };
    useContextMock.mockReturnValue(context);

    expect(useI18n()).toBe(context);
  });

  it("throws when used without I18nProvider", () => {
    useContextMock.mockReturnValue(null);

    expect(() => useI18n()).toThrow("useI18n must be used within I18nProvider");
  });
});
