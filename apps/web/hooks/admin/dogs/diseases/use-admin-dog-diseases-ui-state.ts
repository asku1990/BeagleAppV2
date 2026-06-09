"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

type UseAdminDogDiseasesUiStateInput = {
  initialDiseaseCode?: string | null;
  initialQuery?: string;
};

type AdminDogDiseasesRouteState = {
  diseaseCode: string | null | undefined;
  query: string;
  page: number;
};

function readPage(value: string | null): number {
  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function readDiseaseCode(value: string | null): string | null | undefined {
  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.toLowerCase() === "all") {
    return null;
  }

  return trimmed.length > 0 ? trimmed : undefined;
}

function readQuery(value: string | null): string {
  return value?.trim() ?? "";
}

function normalizePage(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function toQueryString(state: AdminDogDiseasesRouteState): string {
  const params = new URLSearchParams();

  if (state.diseaseCode !== undefined) {
    if (state.diseaseCode === null) {
      params.set("diseaseCode", "all");
    } else {
      params.set("diseaseCode", state.diseaseCode);
    }
  }

  const query = state.query.trim();
  if (query) {
    params.set("query", query);
  }

  if (state.page > 1) {
    params.set("page", String(state.page));
  }

  return params.toString();
}

export function readAdminDogDiseasesUrlState(params: SearchParamsLike): {
  diseaseCode: string | null | undefined;
  query: string;
  page: number;
} {
  return {
    diseaseCode: readDiseaseCode(params.get("diseaseCode")),
    query: readQuery(params.get("query")),
    page: readPage(params.get("page")),
  };
}

export function useAdminDogDiseasesUiState({
  initialDiseaseCode = "epi",
  initialQuery = "",
}: UseAdminDogDiseasesUiStateInput = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlState = useMemo(
    () => readAdminDogDiseasesUrlState(searchParams),
    [searchParams],
  );

  const diseaseCode =
    urlState.diseaseCode === undefined
      ? initialDiseaseCode
      : urlState.diseaseCode;
  const query = urlState.query || initialQuery.trim();

  const commitState = useCallback(
    (nextState: AdminDogDiseasesRouteState) => {
      const query = toQueryString(nextState);
      const href = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [pathname, router],
  );

  const submitSearch = useCallback(
    (nextState: { diseaseCode: string | null | undefined; query: string }) => {
      commitState({
        diseaseCode: nextState.diseaseCode,
        query: nextState.query,
        page: 1,
      });
    },
    [commitState],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      commitState({
        diseaseCode,
        query,
        page: normalizePage(nextPage),
      });
    },
    [commitState, diseaseCode, query],
  );

  return {
    diseaseCode,
    query,
    page: urlState.page,
    isPending,
    submitSearch,
    setPage,
  };
}
