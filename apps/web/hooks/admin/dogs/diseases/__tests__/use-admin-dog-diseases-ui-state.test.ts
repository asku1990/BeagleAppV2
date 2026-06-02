import { describe, expect, it, vi } from "vitest";
import {
  readAdminDogDiseasesUrlState,
  useAdminDogDiseasesUiState,
} from "../use-admin-dog-diseases-ui-state";

const { pathnameMock, pushMock, searchParamsMock } = vi.hoisted(() => ({
  pathnameMock: "/admin/dogs/diseases",
  pushMock: vi.fn(),
  searchParamsMock: {
    get: vi.fn((key: string) => {
      const params: Record<string, string> = {
        diseaseCode: "pur",
        page: "3",
      };
      return params[key] ?? null;
    }),
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParamsMock,
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<object>("react");
  return {
    ...actual,
    useMemo: (fn: () => unknown) => fn(),
    useCallback: <T extends (...args: never[]) => unknown>(fn: T) => fn,
    useTransition: () => [false, (callback: () => void) => callback()],
  };
});

describe("admin dog diseases ui state", () => {
  it("parses the URL state", () => {
    expect(readAdminDogDiseasesUrlState(searchParamsMock)).toEqual({
      diseaseCode: "pur",
      page: 3,
    });
  });

  it("commits disease and page changes to the URL", () => {
    const ui = useAdminDogDiseasesUiState({ initialDiseaseCode: "epi" });

    expect(ui.diseaseCode).toBe("pur");
    expect(ui.page).toBe(3);

    ui.setDiseaseCode(null);
    ui.setPage(8);

    expect(pushMock.mock.calls.map((call) => call[0])).toEqual([
      "/admin/dogs/diseases?diseaseCode=all",
      "/admin/dogs/diseases?diseaseCode=pur&page=8",
    ]);
    expect(
      pushMock.mock.calls.every(
        (call) =>
          typeof call[1] === "object" &&
          call[1] !== null &&
          "scroll" in call[1] &&
          call[1].scroll === false,
      ),
    ).toBe(true);
  });
});
