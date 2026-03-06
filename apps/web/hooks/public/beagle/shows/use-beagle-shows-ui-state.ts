"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BEAGLE_SHOWS_DEFAULT_PAGE_SIZE,
  BEAGLE_SHOWS_DEFAULT_SORT,
  BEAGLE_SHOWS_PAGE_SIZE_OPTIONS,
  normalizeIsoDateOnlyInput,
  parseShowYearInput,
  type BeagleShowsFilterMode,
  type BeagleShowsQueryState,
  type BeagleShowSearchSort,
} from "@/lib/public/beagle/shows";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

const DEFAULT_STATE: BeagleShowsQueryState = {
  mode: "year",
  year: "",
  dateFrom: "",
  dateTo: "",
  page: 1,
  pageSize: BEAGLE_SHOWS_DEFAULT_PAGE_SIZE,
  sort: BEAGLE_SHOWS_DEFAULT_SORT,
};

function trimValue(value: string | null): string {
  return (value ?? "").trim();
}

function readPage(value: string | null): number {
  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function readPageSize(value: string | null): number {
  if (!value) {
    return BEAGLE_SHOWS_DEFAULT_PAGE_SIZE;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return BEAGLE_SHOWS_DEFAULT_PAGE_SIZE;
  }

  if (
    !BEAGLE_SHOWS_PAGE_SIZE_OPTIONS.includes(
      parsed as (typeof BEAGLE_SHOWS_PAGE_SIZE_OPTIONS)[number],
    )
  ) {
    return BEAGLE_SHOWS_DEFAULT_PAGE_SIZE;
  }

  return parsed;
}

function readSort(value: string | null): BeagleShowSearchSort {
  if (value === "date-asc" || value === "date-desc") {
    return value;
  }

  return BEAGLE_SHOWS_DEFAULT_SORT;
}

function readMode(
  value: string | null,
  fallback: BeagleShowsFilterMode,
): BeagleShowsFilterMode {
  if (value === "year" || value === "range") {
    return value;
  }

  return fallback;
}

function readYearInput(value: string | null): string {
  const trimmed = trimValue(value);
  return parseShowYearInput(trimmed) != null ? trimmed : "";
}

export function readUrlShowsState(
  params: SearchParamsLike,
): BeagleShowsQueryState {
  const dateFrom = normalizeIsoDateOnlyInput(params.get("dateFrom"));
  const dateTo = normalizeIsoDateOnlyInput(params.get("dateTo"));
  const fallbackMode: BeagleShowsFilterMode =
    dateFrom || dateTo ? "range" : "year";

  return {
    mode: readMode(params.get("mode"), fallbackMode),
    year: readYearInput(params.get("year")),
    dateFrom,
    dateTo,
    page: readPage(params.get("page")),
    pageSize: readPageSize(params.get("pageSize")),
    sort: readSort(params.get("sort")),
  };
}

export function toShowsQueryString(state: BeagleShowsQueryState): string {
  const params = new URLSearchParams();

  if (state.mode === "range") {
    params.set("mode", "range");
    if (state.dateFrom) {
      params.set("dateFrom", state.dateFrom);
    }
    if (state.dateTo) {
      params.set("dateTo", state.dateTo);
    }
  } else if (state.year) {
    params.set("year", state.year);
  }

  if (state.page > 1) {
    params.set("page", String(state.page));
  }
  if (state.pageSize !== BEAGLE_SHOWS_DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(state.pageSize));
  }
  if (state.sort !== BEAGLE_SHOWS_DEFAULT_SORT) {
    params.set("sort", state.sort);
  }

  return params.toString();
}

export function useBeagleShowsUiState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlState = useMemo(
    () => readUrlShowsState(searchParams),
    [searchParams],
  );

  const [formState, setFormState] = useState({
    mode: urlState.mode,
    year: urlState.year,
    dateFrom: urlState.dateFrom,
    dateTo: urlState.dateTo,
  });

  useEffect(() => {
    // Sync local draft fields when URL query state changes from navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormState({
      mode: urlState.mode,
      year: urlState.year,
      dateFrom: urlState.dateFrom,
      dateTo: urlState.dateTo,
    });
  }, [urlState.mode, urlState.year, urlState.dateFrom, urlState.dateTo]);

  const commitState = useCallback(
    (nextState: BeagleShowsQueryState) => {
      const query = toShowsQueryString(nextState);
      const href = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router],
  );

  const setMode = useCallback((mode: BeagleShowsFilterMode) => {
    setFormState((current) =>
      mode === "year"
        ? { ...current, mode, dateFrom: "", dateTo: "" }
        : { ...current, mode, year: "" },
    );
  }, []);

  const setYear = useCallback((year: string) => {
    setFormState((current) => ({ ...current, year }));
  }, []);

  const setDateFrom = useCallback((dateFrom: string) => {
    setFormState((current) => ({ ...current, dateFrom }));
  }, []);

  const setDateTo = useCallback((dateTo: string) => {
    setFormState((current) => ({ ...current, dateTo }));
  }, []);

  const submitSearch = useCallback(() => {
    commitState({
      ...urlState,
      mode: formState.mode,
      year: formState.mode === "year" ? trimValue(formState.year) : "",
      dateFrom:
        formState.mode === "range"
          ? normalizeIsoDateOnlyInput(formState.dateFrom)
          : "",
      dateTo:
        formState.mode === "range"
          ? normalizeIsoDateOnlyInput(formState.dateTo)
          : "",
      page: 1,
    });
  }, [
    commitState,
    formState.mode,
    formState.year,
    formState.dateFrom,
    formState.dateTo,
    urlState,
  ]);

  const resetSearch = useCallback(() => {
    setFormState({
      mode: "year",
      year: "",
      dateFrom: "",
      dateTo: "",
    });

    commitState(DEFAULT_STATE);
  }, [commitState]);

  const setPage = useCallback(
    (page: number) => {
      commitState({ ...urlState, page: Math.max(1, page) });
    },
    [commitState, urlState],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      const normalizedPageSize = BEAGLE_SHOWS_PAGE_SIZE_OPTIONS.includes(
        pageSize as (typeof BEAGLE_SHOWS_PAGE_SIZE_OPTIONS)[number],
      )
        ? pageSize
        : BEAGLE_SHOWS_DEFAULT_PAGE_SIZE;

      commitState({ ...urlState, page: 1, pageSize: normalizedPageSize });
    },
    [commitState, urlState],
  );

  const setSort = useCallback(
    (sort: BeagleShowSearchSort) => {
      commitState({ ...urlState, sort, page: 1 });
    },
    [commitState, urlState],
  );

  return {
    formState,
    urlState,
    isPending,
    setMode,
    setYear,
    setDateFrom,
    setDateTo,
    submitSearch,
    resetSearch,
    setPage,
    setPageSize,
    setSort,
  };
}
