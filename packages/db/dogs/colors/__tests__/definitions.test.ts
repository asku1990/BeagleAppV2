import { DogColorStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { DOG_COLOR_DEFINITIONS } from "../definitions";

describe("DOG_COLOR_DEFINITIONS", () => {
  it("contains the complete canonical and legacy color catalog", () => {
    const codes = DOG_COLOR_DEFINITIONS.map((definition) => definition.code);
    const counts = DOG_COLOR_DEFINITIONS.reduce<Record<string, number>>(
      (result, definition) => ({
        ...result,
        [definition.status]: (result[definition.status] ?? 0) + 1,
      }),
      {},
    );

    expect(DOG_COLOR_DEFINITIONS).toHaveLength(54);
    expect(new Set(codes).size).toBe(54);
    expect(codes).not.toContain(0);
    expect(counts).toEqual({
      [DogColorStatus.SELECTABLE]: 7,
      [DogColorStatus.HIDDEN]: 21,
      [DogColorStatus.LEGACY_UNKNOWN]: 26,
    });
    expect(
      DOG_COLOR_DEFINITIONS.filter(
        (definition) => definition.status === DogColorStatus.SELECTABLE,
      ).map((definition) => definition.code),
    ).toEqual([886, 207, 121, 123, 125, 252, 539]);
    expect(
      DOG_COLOR_DEFINITIONS.every(
        (definition) =>
          definition.nameFi.length > 0 && definition.nameSv.length > 0,
      ),
    ).toBe(true);
  });
});
