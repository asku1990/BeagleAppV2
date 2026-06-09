"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminDogDiseaseGroup } from "@beagle/contracts";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

type UseAdminDogDiseasesUiStateInput = {
  initialDiseaseGroup?: AdminDogDiseaseGroup | null;
  initialQuery?: string;
};

type AdminDogDiseasesRouteState = {
  diseaseGroup: AdminDogDiseaseGroup | null;
  query: string;
  page: number;
};

const DEFAULT_DISEASE_GROUP: AdminDogDiseaseGroup = "EPILEPSIA";

function readPage(value: string | null): number {
  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function readDiseaseGroup(
  value: string | null,
): AdminDogDiseaseGroup | null | undefined {
  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.toLowerCase() === "all") {
    return null;
  }

  const normalized = trimmed.toUpperCase();
  if (
    normalized === "EPILEPSIA" ||
    normalized === "LAFORA" ||
    normalized === "PURENTA" ||
    normalized === "MLS" ||
    normalized === "MUU"
  ) {
    return normalized;
  }

  return undefined;
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

  if (state.diseaseGroup === null) {
    params.set("diseaseGroup", "all");
  } else {
    params.set("diseaseGroup", state.diseaseGroup);
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
  diseaseGroup: AdminDogDiseaseGroup | null | undefined;
  query: string;
  page: number;
} {
  return {
    diseaseGroup: readDiseaseGroup(params.get("diseaseGroup")),
    query: readQuery(params.get("query")),
    page: readPage(params.get("page")),
  };
}

export function useAdminDogDiseasesUiState({
  initialDiseaseGroup = DEFAULT_DISEASE_GROUP,
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

  const diseaseGroup =
    urlState.diseaseGroup === undefined
      ? initialDiseaseGroup
      : urlState.diseaseGroup;
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
    (nextState: {
      diseaseGroup: AdminDogDiseaseGroup | null;
      query: string;
    }) => {
      commitState({
        diseaseGroup: nextState.diseaseGroup,
        query: nextState.query,
        page: 1,
      });
    },
    [commitState],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      commitState({
        diseaseGroup,
        query,
        page: normalizePage(nextPage),
      });
    },
    [commitState, diseaseGroup, query],
  );

  return {
    diseaseGroup,
    query,
    page: urlState.page,
    isPending,
    submitSearch,
    setPage,
  };
}
