import { beforeEach, describe, expect, it, vi } from "vitest";
import { seedDogColorsDb } from "../seed-dog-colors";

const { dogColorUpsertMock } = vi.hoisted(() => ({
  dogColorUpsertMock: vi.fn(),
}));

vi.mock("@db/core/prisma", () => ({
  prisma: {
    dogColor: { upsert: dogColorUpsertMock },
  },
}));

describe("seedDogColorsDb", () => {
  beforeEach(() => {
    dogColorUpsertMock.mockReset();
    dogColorUpsertMock.mockResolvedValue(undefined);
  });

  it("upserts every canonical definition and returns its code set", async () => {
    const result = await seedDogColorsDb();

    expect(dogColorUpsertMock).toHaveBeenCalledTimes(54);
    expect(result.codes).toHaveLength(54);
    expect(dogColorUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: 121 },
        update: expect.objectContaining({ status: "SELECTABLE" }),
      }),
    );
  });
});
