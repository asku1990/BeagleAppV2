import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminDogWriteDb } from "../update-dog";

describe("updateAdminDogWriteDb", () => {
  const dogFindUniqueMock = vi.fn();
  const breederFindUniqueMock = vi.fn();
  const dogUpdateMock = vi.fn();
  const ownerFindFirstMock = vi.fn();
  const dogOwnershipDeleteManyMock = vi.fn();
  const dogOwnershipFindManyMock = vi.fn();
  const dogOwnershipCreateMock = vi.fn();
  const dogRegistrationFindManyMock = vi.fn();
  const dogRegistrationDeleteMock = vi.fn();
  const dogRegistrationDeleteManyMock = vi.fn();
  const dogRegistrationUpdateMock = vi.fn();
  const dogRegistrationCreateMock = vi.fn();
  const dogRegistrationCreateManyMock = vi.fn();
  const dogTitleDeleteManyMock = vi.fn();
  const dogTitleCreateManyMock = vi.fn();

  const tx = {
    dog: {
      findUnique: dogFindUniqueMock,
      update: dogUpdateMock,
    },
    breeder: {
      findUnique: breederFindUniqueMock,
    },
    owner: {
      findFirst: ownerFindFirstMock,
      create: vi.fn(),
    },
    dogOwnership: {
      deleteMany: dogOwnershipDeleteManyMock,
      findMany: dogOwnershipFindManyMock,
      create: dogOwnershipCreateMock,
    },
    dogRegistration: {
      findMany: dogRegistrationFindManyMock,
      delete: dogRegistrationDeleteMock,
      deleteMany: dogRegistrationDeleteManyMock,
      update: dogRegistrationUpdateMock,
      create: dogRegistrationCreateMock,
      createMany: dogRegistrationCreateManyMock,
    },
    dogTitle: {
      deleteMany: dogTitleDeleteManyMock,
      createMany: dogTitleCreateManyMock,
    },
  };

  beforeEach(() => {
    dogFindUniqueMock.mockReset();
    breederFindUniqueMock.mockReset();
    dogUpdateMock.mockReset();
    ownerFindFirstMock.mockReset();
    dogOwnershipDeleteManyMock.mockReset();
    dogOwnershipFindManyMock.mockReset();
    dogOwnershipCreateMock.mockReset();
    dogRegistrationFindManyMock.mockReset();
    dogRegistrationDeleteMock.mockReset();
    dogRegistrationDeleteManyMock.mockReset();
    dogRegistrationUpdateMock.mockReset();
    dogRegistrationCreateMock.mockReset();
    dogRegistrationCreateManyMock.mockReset();
    dogTitleDeleteManyMock.mockReset();
    dogTitleCreateManyMock.mockReset();
  });

  it("promotes existing secondary registration to primary", async () => {
    dogFindUniqueMock.mockResolvedValue({ id: "dog_1" });
    breederFindUniqueMock.mockResolvedValue(null);
    dogUpdateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });
    dogOwnershipFindManyMock.mockResolvedValue([]);
    dogRegistrationFindManyMock.mockResolvedValue([
      { id: "reg_primary", registrationNo: "FI11111/21" },
      { id: "reg_secondary", registrationNo: "FI22222/21" },
    ]);

    await expect(
      updateAdminDogWriteDb(
        {
          id: "dog_1",
          name: "Kide",
          sex: "FEMALE",
          birthDate: null,
          breederNameText: null,
          sireId: null,
          damId: null,
          ownerNames: [],
          ekNo: null,
          note: null,
          registrationNo: "FI22222/21",
        },
        tx as never,
      ),
    ).resolves.toEqual({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
      registrationNo: "FI22222/21",
    });

    expect(dogRegistrationDeleteMock).toHaveBeenCalledWith({
      where: { id: "reg_secondary" },
    });
    expect(dogRegistrationUpdateMock).toHaveBeenCalledWith({
      where: { id: "reg_primary" },
      data: { registrationNo: "FI22222/21" },
    });
  });

  it("does not update parent links when parent ids are undefined", async () => {
    dogFindUniqueMock.mockResolvedValue({ id: "dog_1" });
    breederFindUniqueMock.mockResolvedValue(null);
    dogUpdateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });
    dogOwnershipFindManyMock.mockResolvedValue([]);
    dogRegistrationFindManyMock.mockResolvedValue([]);

    await updateAdminDogWriteDb(
      {
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        birthDate: null,
        breederNameText: null,
        sireId: undefined,
        damId: undefined,
        ownerNames: [],
        ekNo: null,
        note: null,
        registrationNo: "FI11111/21",
      },
      tx as never,
    );

    expect(dogUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          sireId: expect.anything(),
          damId: expect.anything(),
        }),
      }),
    );
  });

  it("does not sync ownerships when owner names are omitted", async () => {
    dogFindUniqueMock.mockResolvedValue({ id: "dog_1" });
    breederFindUniqueMock.mockResolvedValue(null);
    dogUpdateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });
    dogRegistrationFindManyMock.mockResolvedValue([]);

    await updateAdminDogWriteDb(
      {
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        birthDate: null,
        breederNameText: null,
        sireId: undefined,
        damId: undefined,
        ownerNames: undefined,
        ekNo: null,
        note: null,
        registrationNo: "FI11111/21",
      },
      tx as never,
    );

    expect(ownerFindFirstMock).not.toHaveBeenCalled();
    expect(dogOwnershipDeleteManyMock).not.toHaveBeenCalled();
    expect(dogOwnershipFindManyMock).not.toHaveBeenCalled();
    expect(dogOwnershipCreateMock).not.toHaveBeenCalled();
  });

  it("does not update optional scalar fields when they are omitted", async () => {
    dogFindUniqueMock.mockResolvedValue({ id: "dog_1" });
    dogUpdateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      { id: "reg_primary", registrationNo: "FI11111/21" },
    ]);

    await expect(
      updateAdminDogWriteDb(
        {
          id: "dog_1",
          name: "Kide",
          sex: "FEMALE",
          sireId: undefined,
          damId: undefined,
          registrationNo: "FI11111/21",
        },
        tx as never,
      ),
    ).resolves.toEqual({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
      registrationNo: "FI11111/21",
    });

    const dogUpdateArg = dogUpdateMock.mock.calls[0]?.[0];
    expect(dogUpdateArg?.data).not.toHaveProperty("birthDate");
    expect(dogUpdateArg?.data).not.toHaveProperty("breederNameText");
    expect(dogUpdateArg?.data).not.toHaveProperty("breederId");
    expect(dogUpdateArg?.data).not.toHaveProperty("ekNo");
    expect(dogUpdateArg?.data).not.toHaveProperty("note");

    expect(breederFindUniqueMock).not.toHaveBeenCalled();
    expect(dogRegistrationDeleteMock).not.toHaveBeenCalled();
    expect(dogRegistrationDeleteManyMock).not.toHaveBeenCalled();
    expect(dogRegistrationUpdateMock).not.toHaveBeenCalled();
    expect(dogRegistrationCreateMock).not.toHaveBeenCalled();
    expect(dogRegistrationCreateManyMock).not.toHaveBeenCalled();
  });

  it("syncs secondary registrations when provided", async () => {
    dogFindUniqueMock.mockResolvedValue({ id: "dog_1" });
    dogUpdateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      { id: "reg_primary", registrationNo: "FI11111/21" },
      { id: "reg_secondary_remove", registrationNo: "FI33333/21" },
    ]);

    await expect(
      updateAdminDogWriteDb(
        {
          id: "dog_1",
          name: "Kide",
          sex: "FEMALE",
          sireId: undefined,
          damId: undefined,
          registrationNo: "FI11111/21",
          secondaryRegistrationNos: ["FI22222/21"],
        },
        tx as never,
      ),
    ).resolves.toEqual({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
      registrationNo: "FI11111/21",
    });

    expect(dogRegistrationDeleteManyMock).toHaveBeenCalledWith({
      where: { id: { in: ["reg_secondary_remove"] } },
    });
    expect(dogRegistrationCreateManyMock).toHaveBeenCalledWith({
      data: [
        {
          dogId: "dog_1",
          registrationNo: "FI22222/21",
          source: "ADMIN_UI",
        },
      ],
    });
  });

  it("removes promoted secondary before updating primary when sync payload is provided", async () => {
    dogFindUniqueMock.mockResolvedValue({ id: "dog_1" });
    dogUpdateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      { id: "reg_primary", registrationNo: "FI11111/21" },
      { id: "reg_secondary", registrationNo: "FI22222/21" },
    ]);

    await expect(
      updateAdminDogWriteDb(
        {
          id: "dog_1",
          name: "Kide",
          sex: "FEMALE",
          sireId: undefined,
          damId: undefined,
          registrationNo: "FI22222/21",
          secondaryRegistrationNos: ["FI11111/21"],
        },
        tx as never,
      ),
    ).resolves.toEqual({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
      registrationNo: "FI22222/21",
    });

    expect(dogRegistrationDeleteMock).toHaveBeenCalledWith({
      where: { id: "reg_secondary" },
    });
    expect(dogRegistrationUpdateMock).toHaveBeenCalledWith({
      where: { id: "reg_primary" },
      data: { registrationNo: "FI22222/21" },
    });
    expect(dogRegistrationCreateManyMock).toHaveBeenCalledWith({
      data: [
        {
          dogId: "dog_1",
          registrationNo: "FI11111/21",
          source: "ADMIN_UI",
        },
      ],
    });
    expect(dogRegistrationDeleteMock.mock.invocationCallOrder[0]).toBeLessThan(
      dogRegistrationUpdateMock.mock.invocationCallOrder[0],
    );
  });

  it("replaces titles when titles payload is provided", async () => {
    dogFindUniqueMock.mockResolvedValue({ id: "dog_1" });
    dogUpdateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      { id: "reg_primary", registrationNo: "FI11111/21" },
    ]);

    await updateAdminDogWriteDb(
      {
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        sireId: undefined,
        damId: undefined,
        registrationNo: "FI11111/21",
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
    );

    expect(dogTitleDeleteManyMock).toHaveBeenCalledWith({
      where: { dogId: "dog_1" },
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

  it("does not touch titles when titles payload is omitted", async () => {
    dogFindUniqueMock.mockResolvedValue({ id: "dog_1" });
    dogUpdateMock.mockResolvedValue({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      { id: "reg_primary", registrationNo: "FI11111/21" },
    ]);

    await updateAdminDogWriteDb(
      {
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        sireId: undefined,
        damId: undefined,
        registrationNo: "FI11111/21",
      },
      tx as never,
    );

    expect(dogTitleDeleteManyMock).not.toHaveBeenCalled();
    expect(dogTitleCreateManyMock).not.toHaveBeenCalled();
  });
});
