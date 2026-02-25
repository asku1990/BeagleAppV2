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
});
