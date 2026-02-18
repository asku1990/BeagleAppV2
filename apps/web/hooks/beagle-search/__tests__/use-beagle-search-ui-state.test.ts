import { describe, expect, it } from "vitest";
import type { BeagleSearchQueryState } from "@/lib/beagle-search";
import {
  readUrlSearchState,
  toSearchQueryString,
} from "../use-beagle-search-ui-state";

function readParams(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("useBeagleSearchUiState helpers", () => {
  it("falls back for invalid sort and page while trimming primary fields", () => {
    const params = readParams(
      "ek=%20001%20&reg=%20REG-1%20&name=%20Fido%20&page=0&sort=bad",
    );

    const state = readUrlSearchState(params);

    expect(state.ek).toBe("001");
    expect(state.reg).toBe("REG-1");
    expect(state.name).toBe("Fido");
    expect(state.page).toBe(1);
    expect(state.pageSize).toBe(10);
    expect(state.sort).toBe("name-asc");
  });

  it("accepts all supported sort values", () => {
    const sorts = [
      "name-asc",
      "birth-desc",
      "reg-desc",
      "created-desc",
      "ek-asc",
    ] as const;

    for (const sort of sorts) {
      const state = readUrlSearchState(readParams(`sort=${sort}`));
      expect(state.sort).toBe(sort);
    }
  });

  it("serializes only non-default values and boolean flags as 1", () => {
    const state: BeagleSearchQueryState = {
      ek: "123",
      reg: "REG",
      name: "DOG",
      sex: "female",
      birthYearFrom: "2018",
      birthYearTo: "2020",
      ekOnly: true,
      multipleRegsOnly: true,
      page: 2,
      pageSize: 25,
      sort: "reg-desc",
      adv: true,
    };

    const query = toSearchQueryString(state);
    const params = readParams(query);

    expect(params.get("ek")).toBe("123");
    expect(params.get("reg")).toBe("REG");
    expect(params.get("name")).toBe("DOG");
    expect(params.get("sex")).toBe("female");
    expect(params.get("birthYearFrom")).toBe("2018");
    expect(params.get("birthYearTo")).toBe("2020");
    expect(params.get("ekOnly")).toBe("1");
    expect(params.get("multiRegs")).toBe("1");
    expect(params.get("page")).toBe("2");
    expect(params.get("pageSize")).toBe("25");
    expect(params.get("sort")).toBe("reg-desc");
    expect(params.get("adv")).toBe("1");
  });

  it("omits default values from serialized query", () => {
    const state: BeagleSearchQueryState = {
      ek: "",
      reg: "",
      name: "",
      sex: "any",
      birthYearFrom: "",
      birthYearTo: "",
      ekOnly: false,
      multipleRegsOnly: false,
      page: 1,
      pageSize: 10,
      sort: "name-asc",
      adv: false,
    };

    expect(toSearchQueryString(state)).toBe("");
  });

  it("roundtrips advanced and core params through URL state", () => {
    const original: BeagleSearchQueryState = {
      ek: "55",
      reg: "FI-100/24",
      name: "Meri",
      sex: "male",
      birthYearFrom: "2017",
      birthYearTo: "2019",
      ekOnly: true,
      multipleRegsOnly: true,
      page: 3,
      pageSize: 50,
      sort: "ek-asc",
      adv: true,
    };

    const query = toSearchQueryString(original);
    const parsed = readUrlSearchState(readParams(query));

    expect(parsed).toEqual(original);
  });

  it("parses advanced-only query to combined-ready state fields", () => {
    const state = readUrlSearchState(
      readParams("sex=female&multiRegs=1&adv=1&birthYearFrom=2020&page=1"),
    );

    expect(state.ek).toBe("");
    expect(state.reg).toBe("");
    expect(state.name).toBe("");
    expect(state.sex).toBe("female");
    expect(state.multipleRegsOnly).toBe(true);
    expect(state.adv).toBe(true);
    expect(state.birthYearFrom).toBe("2020");
    expect(state.page).toBe(1);
    expect(state.pageSize).toBe(10);
  });

  it("falls back to default pageSize when query value is invalid", () => {
    const state = readUrlSearchState(readParams("name=alpha&pageSize=200"));
    expect(state.pageSize).toBe(10);
  });
});
