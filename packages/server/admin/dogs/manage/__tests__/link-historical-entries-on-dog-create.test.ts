import { beforeEach, describe, expect, it, vi } from "vitest";
import { linkHistoricalEntriesOnDogCreate } from "../link-historical-entries-on-dog-create";

const { linkUnlinkedShowTrialEntriesByRegistrationDbMock } = vi.hoisted(() => ({
  linkUnlinkedShowTrialEntriesByRegistrationDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  linkUnlinkedShowTrialEntriesByRegistrationDb:
    linkUnlinkedShowTrialEntriesByRegistrationDbMock,
}));

describe("linkHistoricalEntriesOnDogCreate", () => {
  beforeEach(() => {
    linkUnlinkedShowTrialEntriesByRegistrationDbMock.mockReset();
    linkUnlinkedShowTrialEntriesByRegistrationDbMock.mockResolvedValue({
      showLinkedCount: 0,
      trialLinkedCount: 0,
    });
  });

  it("normalizes primary and secondary registration numbers before linking", async () => {
    const tx = { marker: "tx" };

    await expect(
      linkHistoricalEntriesOnDogCreate(
        {
          dogId: "dog_1",
          primaryRegistrationNo: " fi12345/21 ",
          secondaryRegistrationNos: [" fi99999/20 ", " "],
        },
        tx as never,
      ),
    ).resolves.toEqual({
      showLinkedCount: 0,
      trialLinkedCount: 0,
    });

    expect(
      linkUnlinkedShowTrialEntriesByRegistrationDbMock,
    ).toHaveBeenCalledWith(
      {
        dogId: "dog_1",
        registrationNos: ["FI12345/21", "FI99999/20"],
      },
      tx,
    );
  });

  it("returns counts from the db linker", async () => {
    linkUnlinkedShowTrialEntriesByRegistrationDbMock.mockResolvedValue({
      showLinkedCount: 2,
      trialLinkedCount: 1,
    });

    await expect(
      linkHistoricalEntriesOnDogCreate(
        {
          dogId: "dog_1",
          primaryRegistrationNo: "FI12345/21",
        },
        {} as never,
      ),
    ).resolves.toEqual({
      showLinkedCount: 2,
      trialLinkedCount: 1,
    });
  });
});
