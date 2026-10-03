import { describe, expect, it, vi } from "vitest";
import type { BeagleTrialsQueryState } from "@/lib/public/beagle/trials";

const { pushMock, replaceMock, setFormStateMock, searchParamsMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    replaceMock: vi.fn(),
    setFormStateMock: vi.fn(),
    searchParamsMock: {
      get: (key: string) =>
        ({ page: "3", sort: "date-asc" })[key as "page" | "sort"] ?? null,
    },
  }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/beagle/trials",
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => searchParamsMock,
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useMemo: (fn: () => unknown) => fn(),
    useCallback: <T extends (...args: never[]) => unknown>(fn: T) => fn,
    useEffect: () => undefined,
    useTransition: () => [false, (callback: () => void) => callback()],
    useState: (initial: unknown) => [initial, setFormStateMock],
  };
});

import {
  readUrlTrialsState,
  toTrialsQueryString,
  useBeagleTrialsUiState,
} from "../use-beagle-trials-ui-state";

function readParams(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("useBeagleTrialsUiState helpers", () => {
  it("ignores legacy year URL values and uses safe defaults", () => {
    const params = readParams("year=2025&page=0&pageSize=500&sort=bad");

    const state = readUrlTrialsState(params);

    expect(state.mode).toBe("season");
    expect(state.season).toBe("");
    expect(state.page).toBe(1);
    expect(state.pageSize).toBe(10);
    expect(state.sort).toBe("date-desc");
  });

  it("parses range mode and valid iso dates", () => {
    const state = readUrlTrialsState(
      readParams(
        "mode=range&dateFrom=2025-01-01&dateTo=2025-12-31&page=2&pageSize=25&sort=date-asc",
      ),
    );

    expect(state).toEqual({
      mode: "range",
      season: "",
      dateFrom: "2025-01-01",
      dateTo: "2025-12-31",
      page: 2,
      pageSize: 25,
      sort: "date-asc",
    });
  });

  it("serializes only non-default values", () => {
    const state: BeagleTrialsQueryState = {
      mode: "season",
      season: "2025-2026",
      dateFrom: "",
      dateTo: "",
      page: 1,
      pageSize: 10,
      sort: "date-desc",
    };

    expect(toTrialsQueryString(state)).toBe("season=2025-2026");
  });

  it("adopts the resolved default season in state and URL", () => {
    const ui = useBeagleTrialsUiState();

    ui.setDefaultSeason("2025-2026");

    const update = setFormStateMock.mock.calls[0]?.[0] as (
      current: BeagleTrialsQueryState,
    ) => BeagleTrialsQueryState;
    expect(
      update({
        mode: "season",
        season: "",
        dateFrom: "",
        dateTo: "",
        page: 1,
        pageSize: 10,
        sort: "date-desc",
      }).season,
    ).toBe("2025-2026");
    expect(replaceMock).toHaveBeenCalledWith(
      "/beagle/trials?season=2025-2026&page=3&sort=date-asc",
      { scroll: false },
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
