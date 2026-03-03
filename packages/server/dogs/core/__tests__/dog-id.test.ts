import { describe, expect, it } from "vitest";
import { parseDogId } from "../dog-id";

describe("parseDogId", () => {
  it("returns null for whitespace-only input", () => {
    expect(parseDogId("   ")).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    expect(parseDogId(" dog_1 ")).toBe("dog_1");
  });

  it("accepts legacy-like ids", () => {
    expect(parseDogId("dog1")).toBe("dog1");
    expect(parseDogId("dog_1")).toBe("dog_1");
    expect(parseDogId("dog-casing")).toBe("dog-casing");
  });
});
