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
  BEAGLE_TRIALS_DEFAULT_PAGE_SIZE,
  BEAGLE_TRIALS_DEFAULT_SORT,
  BEAGLE_TRIALS_PAGE_SIZE_OPTIONS,
  normalizeIsoDateOnlyInput,
  parseTrialYearInput,
  type BeagleTrialsFilterMode,
  type BeagleTrialsQueryState,
  type BeagleTrialSearchSort,
} from "@/lib/public/beagle/trials";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

const DEFAULT_STATE: BeagleTrialsQueryState = {
  mode: "year",
  year: "",
  dateFrom: "",
  dateTo: "",
  page: 1,
  pageSize: BEAGLE_TRIALS_DEFAULT_PAGE_SIZE,
  sort: BEAGLE_TRIALS_DEFAULT_SORT,
};

function trimValue(value: string | null): string {
  return (value ?? "").trim();
}

function readPage(value: string | null): number {
  if (!value) return 1;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function readPageSize(value: string | null): number {
  if (!value) return BEAGLE_TRIALS_DEFAULT_PAGE_SIZE;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return BEAGLE_TRIALS_DEFAULT_PAGE_SIZE;

  if (
    !BEAGLE_TRIALS_PAGE_SIZE_OPTIONS.includes(
      parsed as (typeof BEAGLE_TRIALS_PAGE_SIZE_OPTIONS)[number],
    )
  ) {
    return BEAGLE_TRIALS_DEFAULT_PAGE_SIZE;
  }

  return parsed;
}

function readSort(value: string | null): BeagleTrialSearchSort {
  if (value === "date-asc" || value === "date-desc") {
    return value;
  }
  return BEAGLE_TRIALS_DEFAULT_SORT;
}

function readMode(
  value: string | null,
  fallback: BeagleTrialsFilterMode,
): BeagleTrialsFilterMode {
  if (value === "year" || value === "range") {
    return value;
  }
  return fallback;
}

function readYearInput(value: string | null): string {
  const trimmed = trimValue(value);
  return parseTrialYearInput(trimmed) != null ? trimmed : "";
}

export function readUrlTrialsState(
  params: SearchParamsLike,
): BeagleTrialsQueryState {
  const dateFrom = normalizeIsoDateOnlyInput(params.get("dateFrom"));
  const dateTo = normalizeIsoDateOnlyInput(params.get("dateTo"));
  const fallbackMode: BeagleTrialsFilterMode =
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

export function toTrialsQueryString(state: BeagleTrialsQueryState): string {
  const params = new URLSearchParams();

  if (state.mode === "range") {
    params.set("mode", "range");
    if (state.dateFrom) params.set("dateFrom", state.dateFrom);
    if (state.dateTo) params.set("dateTo", state.dateTo);
  } else if (state.year) {
    params.set("year", state.year);
  }

  if (state.page > 1) {
    params.set("page", String(state.page));
  }
  if (state.pageSize !== BEAGLE_TRIALS_DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(state.pageSize));
  }
  if (state.sort !== BEAGLE_TRIALS_DEFAULT_SORT) {
    params.set("sort", state.sort);
  }

  return params.toString();
}

export function useBeagleTrialsUiState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlState = useMemo(
    () => readUrlTrialsState(searchParams),
    [searchParams],
  );

  const [formState, setFormState] = useState({
    mode: urlState.mode,
    year: urlState.year,
    dateFrom: urlState.dateFrom,
    dateTo: urlState.dateTo,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormState({
      mode: urlState.mode,
      year: urlState.year,
      dateFrom: urlState.dateFrom,
      dateTo: urlState.dateTo,
    });
  }, [urlState.mode, urlState.year, urlState.dateFrom, urlState.dateTo]);

  const commitState = useCallback(
    (nextState: BeagleTrialsQueryState) => {
      const query = toTrialsQueryString(nextState);
      const href = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router],
  );

  const setMode = useCallback((mode: BeagleTrialsFilterMode) => {
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
      const normalizedPageSize = BEAGLE_TRIALS_PAGE_SIZE_OPTIONS.includes(
        pageSize as (typeof BEAGLE_TRIALS_PAGE_SIZE_OPTIONS)[number],
      )
        ? pageSize
        : BEAGLE_TRIALS_DEFAULT_PAGE_SIZE;

      commitState({ ...urlState, page: 1, pageSize: normalizedPageSize });
    },
    [commitState, urlState],
  );

  const setSort = useCallback(
    (sort: BeagleTrialSearchSort) => {
      commitState({ ...urlState, page: 1, sort });
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
