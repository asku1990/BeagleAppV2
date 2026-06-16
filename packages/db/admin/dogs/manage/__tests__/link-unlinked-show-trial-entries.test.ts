import { beforeEach, describe, expect, it, vi } from "vitest";
import { linkUnlinkedShowTrialEntriesByRegistrationDb } from "../link-unlinked-show-trial-entries";

describe("linkUnlinkedShowTrialEntriesByRegistrationDb", () => {
  const showEntryUpdateManyMock = vi.fn();
  const trialEntryUpdateManyMock = vi.fn();

  const tx = {
    showEntry: {
      updateMany: showEntryUpdateManyMock,
    },
    trialEntry: {
      updateMany: trialEntryUpdateManyMock,
    },
  };

  beforeEach(() => {
    showEntryUpdateManyMock.mockReset();
    trialEntryUpdateManyMock.mockReset();
    showEntryUpdateManyMock.mockResolvedValue({ count: 0 });
    trialEntryUpdateManyMock.mockResolvedValue({ count: 0 });
  });

  it("returns zero counts when registration numbers are empty", async () => {
    await expect(
      linkUnlinkedShowTrialEntriesByRegistrationDb(
        {
          dogId: "dog_1",
          registrationNos: [],
        },
        tx as never,
      ),
    ).resolves.toEqual({
      showLinkedCount: 0,
      trialLinkedCount: 0,
    });

    expect(showEntryUpdateManyMock).not.toHaveBeenCalled();
    expect(trialEntryUpdateManyMock).not.toHaveBeenCalled();
  });

  it("links unlinked show and trial entries by normalized registration numbers", async () => {
    showEntryUpdateManyMock.mockResolvedValue({ count: 2 });
    trialEntryUpdateManyMock.mockResolvedValue({ count: 1 });

    await expect(
      linkUnlinkedShowTrialEntriesByRegistrationDb(
        {
          dogId: "dog_1",
          registrationNos: ["FI12345/21", "FI99999/20"],
        },
        tx as never,
      ),
    ).resolves.toEqual({
      showLinkedCount: 2,
      trialLinkedCount: 1,
    });

    expect(showEntryUpdateManyMock).toHaveBeenCalledWith({
      where: {
        dogId: null,
        OR: [
          {
            registrationNoSnapshot: {
              equals: "FI12345/21",
              mode: "insensitive",
            },
          },
          {
            registrationNoSnapshot: {
              equals: "FI99999/20",
              mode: "insensitive",
            },
          },
        ],
      },
      data: {
        dogId: "dog_1",
      },
    });

    expect(trialEntryUpdateManyMock).toHaveBeenCalledWith({
      where: {
        dogId: null,
        OR: [
          {
            rekisterinumeroSnapshot: {
              equals: "FI12345/21",
              mode: "insensitive",
            },
          },
          {
            rekisterinumeroSnapshot: {
              equals: "FI99999/20",
              mode: "insensitive",
            },
          },
        ],
      },
      data: {
        dogId: "dog_1",
      },
    });
  });

  it("deduplicates registration numbers before querying", async () => {
    await linkUnlinkedShowTrialEntriesByRegistrationDb(
      {
        dogId: "dog_1",
        registrationNos: ["FI12345/21", "FI12345/21"],
      },
      tx as never,
    );

    expect(showEntryUpdateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            {
              registrationNoSnapshot: {
                equals: "FI12345/21",
                mode: "insensitive",
              },
            },
          ],
        }),
      }),
    );
  });

  it("only updates rows where dogId is null", async () => {
    await linkUnlinkedShowTrialEntriesByRegistrationDb(
      {
        dogId: "dog_1",
        registrationNos: ["FI12345/21"],
      },
      tx as never,
    );

    expect(showEntryUpdateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dogId: null,
        }),
      }),
    );
    expect(trialEntryUpdateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dogId: null,
        }),
      }),
    );
  });
});
