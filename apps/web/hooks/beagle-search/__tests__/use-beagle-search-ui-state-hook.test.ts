import { describe, expect, it, vi } from "vitest";

const {
  pathnameMock,
  replaceMock,
  searchParamsMock,
  setFormStateMock,
  stateTupleMock,
} = vi.hoisted(() => {
  const state = {
    ek: " 100 ",
    reg: " REG-1 ",
    name: " Meri ",
    sex: "any",
    birthYearFrom: "2019",
    birthYearTo: "2020",
    ekOnly: false,
    multipleRegsOnly: false,
  };
  return {
    pathnameMock: "/beagles/search",
    replaceMock: vi.fn(),
    searchParamsMock: {
      get: vi.fn((key: string) => {
        const params: Record<string, string> = {
          ek: state.ek,
          reg: state.reg,
          name: state.name,
          sex: state.sex,
          birthYearFrom: state.birthYearFrom,
          birthYearTo: state.birthYearTo,
          page: "2",
          pageSize: "10",
          sort: "name-asc",
          adv: "0",
        };
        return params[key] ?? null;
      }),
    },
    setFormStateMock: vi.fn(),
    stateTupleMock: vi.fn(() => [state, vi.fn()]),
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsMock,
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<object>("react");
  return {
    ...actual,
    useMemo: (fn: () => unknown) => fn(),
    useCallback: <T extends (...args: never[]) => unknown>(fn: T) => fn,
    useTransition: () => [false, (callback: () => void) => callback()],
    useEffect: (fn: () => void) => fn(),
    useState: (initial: unknown) => {
      if (typeof initial === "object") {
        return [initial, setFormStateMock];
      }
      return stateTupleMock(initial);
    },
  };
});

import { useBeagleSearchUiState } from "../use-beagle-search-ui-state";

describe("useBeagleSearchUiState hook", () => {
  it("commits URL updates for submit/reset/page/sort and draft updates", () => {
    const ui = useBeagleSearchUiState();

    ui.setFormField("ek", "ABC");
    ui.setSex("female");
    ui.setBirthYearFrom("2018");
    ui.setBirthYearTo("2022");
    ui.setEkOnly(true);
    ui.setMultipleRegsOnly(true);
    ui.submitSearch();
    ui.resetSearch();
    ui.setPage(4);
    ui.setPageSize(25);
    ui.setSort("reg-desc");
    ui.toggleAdvanced();

    expect(setFormStateMock).toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalled();
    const hrefs = replaceMock.mock.calls.map((call) => String(call[0]));
    expect(hrefs.some((href) => href === "/beagles/search")).toBe(true);
    expect(hrefs.some((href) => href.includes("page=4"))).toBe(true);
    expect(hrefs.some((href) => href.includes("pageSize=25"))).toBe(true);
    expect(hrefs.some((href) => href.includes("sort=reg-desc"))).toBe(true);
    expect(hrefs.some((href) => href.includes("adv=1"))).toBe(true);
    expect(
      replaceMock.mock.calls.every(
        (call) =>
          typeof call[1] === "object" &&
          call[1] !== null &&
          "scroll" in call[1] &&
          call[1].scroll === false,
      ),
    ).toBe(true);
  });
});
