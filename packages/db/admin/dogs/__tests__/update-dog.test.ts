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

  it("removes every registration when registration number is cleared", async () => {
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
          registrationNo: null,
        },
        tx as never,
      ),
    ).resolves.toEqual({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
      registrationNo: null,
    });

    expect(dogRegistrationDeleteManyMock).toHaveBeenCalledWith({
      where: { dogId: "dog_1" },
    });
    expect(dogRegistrationDeleteMock).not.toHaveBeenCalled();
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
        registrationNo: null,
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
        registrationNo: null,
      },
      tx as never,
    );

    expect(ownerFindFirstMock).not.toHaveBeenCalled();
    expect(dogOwnershipDeleteManyMock).not.toHaveBeenCalled();
    expect(dogOwnershipFindManyMock).not.toHaveBeenCalled();
    expect(dogOwnershipCreateMock).not.toHaveBeenCalled();
  });
});
