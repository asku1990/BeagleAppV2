import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminDogWriteDb } from "../create-dog";

describe("createAdminDogWriteDb", () => {
  const breederFindUniqueMock = vi.fn();
  const dogCreateMock = vi.fn();
  const dogRegistrationCreateMock = vi.fn();
  const dogRegistrationCreateManyMock = vi.fn();
  const ownerFindFirstMock = vi.fn();
  const ownerCreateMock = vi.fn();
  const dogOwnershipCreateMock = vi.fn();
  const dogTitleCreateManyMock = vi.fn();

  const tx = {
    breeder: { findUnique: breederFindUniqueMock },
    dog: { create: dogCreateMock },
    dogRegistration: {
      create: dogRegistrationCreateMock,
      createMany: dogRegistrationCreateManyMock,
    },
    owner: {
      findFirst: ownerFindFirstMock,
      create: ownerCreateMock,
    },
    dogOwnership: {
      create: dogOwnershipCreateMock,
    },
    dogTitle: {
      createMany: dogTitleCreateManyMock,
    },
  };

  beforeEach(() => {
    breederFindUniqueMock.mockReset();
    dogCreateMock.mockReset();
    dogRegistrationCreateMock.mockReset();
    dogRegistrationCreateManyMock.mockReset();
    ownerFindFirstMock.mockReset();
    ownerCreateMock.mockReset();
    dogOwnershipCreateMock.mockReset();
    dogTitleCreateManyMock.mockReset();
  });

  it("persists title rows when titles are provided", async () => {
    breederFindUniqueMock.mockResolvedValue(null);
    dogCreateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });
    ownerFindFirstMock.mockResolvedValue({ id: "owner_1" });

    await expect(
      createAdminDogWriteDb(
        {
          name: "Kide",
          sex: "FEMALE",
          birthDate: null,
          breederNameText: null,
          sireId: null,
          damId: null,
          ownerNames: ["Owner One"],
          ekNo: null,
          note: null,
          registrationNo: "FI12345/21",
          titles: [
            {
              awardedOn: new Date("2022-01-10T00:00:00.000Z"),
              titleCode: "FI JVA",
              titleName: "Valio",
              sortOrder: 0,
            },
          ],
        },
        tx as never,
      ),
    ).resolves.toEqual({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });

    expect(dogTitleCreateManyMock).toHaveBeenCalledWith({
      data: [
        {
          dogId: "dog_1",
          awardedOn: new Date("2022-01-10T00:00:00.000Z"),
          titleCode: "FI JVA",
          titleName: "Valio",
          sortOrder: 0,
        },
      ],
    });
  });

  it("skips title persistence when titles are omitted", async () => {
    breederFindUniqueMock.mockResolvedValue(null);
    dogCreateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });

    await createAdminDogWriteDb(
      {
        name: "Kide",
        sex: "FEMALE",
        birthDate: null,
        breederNameText: null,
        sireId: null,
        damId: null,
        ownerNames: [],
        ekNo: null,
        note: null,
        registrationNo: "FI12345/21",
      },
      tx as never,
    );

    expect(dogTitleCreateManyMock).not.toHaveBeenCalled();
  });
});
