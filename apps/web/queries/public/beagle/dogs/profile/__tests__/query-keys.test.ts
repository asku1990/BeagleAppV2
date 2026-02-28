import { describe, expect, it } from "vitest";
import {
  beagleDogProfileQueryKey,
  beagleDogsQueryKeyRoot,
} from "../query-keys";

describe("query-keys", () => {
  describe("beagleDogsQueryKeyRoot", () => {
    it("is the expected root key", () => {
      expect(beagleDogsQueryKeyRoot).toEqual(["beagle", "dogs"]);
    });
  });

  describe("beagleDogProfileQueryKey", () => {
    it("returns expected key for a given dog ID", () => {
      const dogId = "dog_123";
      expect(beagleDogProfileQueryKey(dogId)).toEqual([
        "beagle",
        "dogs",
        "profile",
        dogId,
      ]);
    });
  });
});
