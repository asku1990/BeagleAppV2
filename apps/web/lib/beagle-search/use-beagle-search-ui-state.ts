"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { normalizeBirthYearInput } from "./birth-year";
import type {
  BeagleSearchAdvancedSex,
  BeagleSearchQueryState,
  BeagleSearchSort,
} from "./types";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

const DEFAULT_SORT: BeagleSearchSort = "name-asc";

const DEFAULT_STATE: BeagleSearchQueryState = {
  ek: "",
  reg: "",
  name: "",
  sex: "any",
  birthYearFrom: "",
  birthYearTo: "",
  ekOnly: false,
  multipleRegsOnly: false,
  page: 1,
  sort: DEFAULT_SORT,
  adv: false,
};

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

function readSort(value: string | null): BeagleSearchSort {
  if (
    value === "name-asc" ||
    value === "birth-desc" ||
    value === "reg-desc" ||
    value === "created-desc"
  ) {
    return value;
  }

  return DEFAULT_SORT;
}

function trimValue(value: string | null): string {
  return (value ?? "").trim();
}

function readSex(value: string | null): BeagleSearchAdvancedSex {
  if (value === "male" || value === "female") {
    return value;
  }
  return "any";
}

export function readUrlSearchState(
  params: SearchParamsLike,
): BeagleSearchQueryState {
  return {
    ek: trimValue(params.get("ek")),
    reg: trimValue(params.get("reg")),
    name: trimValue(params.get("name")),
    sex: readSex(params.get("sex")),
    birthYearFrom: normalizeBirthYearInput(params.get("birthYearFrom")),
    birthYearTo: normalizeBirthYearInput(params.get("birthYearTo")),
    ekOnly: params.get("ekOnly") === "1",
    multipleRegsOnly: params.get("multiRegs") === "1",
    page: readPage(params.get("page")),
    sort: readSort(params.get("sort")),
    adv: params.get("adv") === "1",
  };
}

function toQueryString(state: BeagleSearchQueryState): string {
  const params = new URLSearchParams();

  if (state.ek) {
    params.set("ek", state.ek);
  }
  if (state.reg) {
    params.set("reg", state.reg);
  }
  if (state.name) {
    params.set("name", state.name);
  }
  if (state.sex !== "any") {
    params.set("sex", state.sex);
  }
  if (state.birthYearFrom) {
    params.set("birthYearFrom", state.birthYearFrom);
  }
  if (state.birthYearTo) {
    params.set("birthYearTo", state.birthYearTo);
  }
  if (state.ekOnly) {
    params.set("ekOnly", "1");
  }
  if (state.multipleRegsOnly) {
    params.set("multiRegs", "1");
  }
  if (state.page > 1) {
    params.set("page", String(state.page));
  }
  if (state.sort !== DEFAULT_SORT) {
    params.set("sort", state.sort);
  }
  if (state.adv) {
    params.set("adv", "1");
  }

  return params.toString();
}

export function useBeagleSearchUiState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlState = useMemo(
    () => readUrlSearchState(searchParams),
    [searchParams],
  );

  const [formState, setFormState] = useState({
    ek: urlState.ek,
    reg: urlState.reg,
    name: urlState.name,
    sex: urlState.sex,
    birthYearFrom: urlState.birthYearFrom,
    birthYearTo: urlState.birthYearTo,
    ekOnly: urlState.ekOnly,
    multipleRegsOnly: urlState.multipleRegsOnly,
  });

  useEffect(() => {
    // Sync local draft fields when URL query state changes from navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormState({
      ek: urlState.ek,
      reg: urlState.reg,
      name: urlState.name,
      sex: urlState.sex,
      birthYearFrom: urlState.birthYearFrom,
      birthYearTo: urlState.birthYearTo,
      ekOnly: urlState.ekOnly,
      multipleRegsOnly: urlState.multipleRegsOnly,
    });
  }, [
    urlState.ek,
    urlState.reg,
    urlState.name,
    urlState.sex,
    urlState.birthYearFrom,
    urlState.birthYearTo,
    urlState.ekOnly,
    urlState.multipleRegsOnly,
  ]);

  const commitState = useCallback(
    (nextState: BeagleSearchQueryState) => {
      const query = toQueryString(nextState);
      const href = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router],
  );

  const setFormField = useCallback(
    (field: "ek" | "reg" | "name", value: string) => {
      setFormState((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const submitSearch = useCallback(() => {
    commitState({
      ...urlState,
      ek: formState.ek.trim(),
      reg: formState.reg.trim(),
      name: formState.name.trim(),
      sex: formState.sex,
      birthYearFrom: normalizeBirthYearInput(formState.birthYearFrom),
      birthYearTo: normalizeBirthYearInput(formState.birthYearTo),
      ekOnly: formState.ekOnly,
      multipleRegsOnly: formState.multipleRegsOnly,
      page: 1,
    });
  }, [
    commitState,
    formState.ek,
    formState.birthYearFrom,
    formState.birthYearTo,
    formState.ekOnly,
    formState.multipleRegsOnly,
    formState.name,
    formState.reg,
    formState.sex,
    urlState,
  ]);

  const resetSearch = useCallback(() => {
    setFormState({
      ek: "",
      reg: "",
      name: "",
      sex: "any",
      birthYearFrom: "",
      birthYearTo: "",
      ekOnly: false,
      multipleRegsOnly: false,
    });

    commitState(DEFAULT_STATE);
  }, [commitState]);

  const setPage = useCallback(
    (page: number) => {
      commitState({ ...urlState, page: Math.max(1, page) });
    },
    [commitState, urlState],
  );

  const setSort = useCallback(
    (sort: BeagleSearchSort) => {
      commitState({ ...urlState, sort, page: 1 });
    },
    [commitState, urlState],
  );

  const toggleAdvanced = useCallback(() => {
    commitState({ ...urlState, adv: !urlState.adv });
  }, [commitState, urlState]);

  const setMultipleRegsOnly = useCallback((value: boolean) => {
    setFormState((current) => ({ ...current, multipleRegsOnly: value }));
  }, []);

  const setSex = useCallback((value: BeagleSearchAdvancedSex) => {
    setFormState((current) => ({ ...current, sex: value }));
  }, []);

  const setBirthYearFrom = useCallback((value: string) => {
    setFormState((current) => ({ ...current, birthYearFrom: value }));
  }, []);

  const setBirthYearTo = useCallback((value: string) => {
    setFormState((current) => ({ ...current, birthYearTo: value }));
  }, []);

  const setEkOnly = useCallback((value: boolean) => {
    setFormState((current) => ({ ...current, ekOnly: value }));
  }, []);

  return {
    formState,
    urlState,
    isPending,
    setFormField,
    submitSearch,
    resetSearch,
    setPage,
    setSort,
    toggleAdvanced,
    setSex,
    setBirthYearFrom,
    setBirthYearTo,
    setEkOnly,
    setMultipleRegsOnly,
  };
}
