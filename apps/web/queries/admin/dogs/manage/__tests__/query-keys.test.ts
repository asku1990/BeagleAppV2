import { describe, expect, it } from "vitest";
import {
  adminDogBreederOptionsQueryKey,
  adminDogBreederOptionsQueryKeyRoot,
  adminDogOwnerOptionsQueryKey,
  adminDogOwnerOptionsQueryKeyRoot,
  adminDogParentOptionsQueryKey,
  adminDogParentOptionsQueryKeyRoot,
  adminDogsQueryKey,
  adminDogsQueryKeyRoot,
} from "../query-keys";

describe("admin dogs query keys", () => {
  it("builds dogs list key", () => {
    expect(
      adminDogsQueryKey({
        query: "kide",
        sex: "FEMALE",
        page: 2,
        pageSize: 50,
        sort: "name-asc",
      }),
    ).toEqual([...adminDogsQueryKeyRoot, "kide", "FEMALE", 2, 50, "name-asc"]);
  });

  it("builds breeder options key", () => {
    expect(adminDogBreederOptionsQueryKey("metsa", 100)).toEqual([
      ...adminDogBreederOptionsQueryKeyRoot,
      "metsa",
      100,
    ]);
  });

  it("builds owner options key", () => {
    expect(adminDogOwnerOptionsQueryKey("esa", 20)).toEqual([
      ...adminDogOwnerOptionsQueryKeyRoot,
      "esa",
      20,
    ]);
  });

  it("builds parent options key", () => {
    expect(adminDogParentOptionsQueryKey("korven", 30)).toEqual([
      ...adminDogParentOptionsQueryKeyRoot,
      "korven",
      30,
    ]);
  });
});
