import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminDogDiseases } from "../list-dog-diseases";

const { listAdminDogDiseasesDbMock } = vi.hoisted(() => ({
  listAdminDogDiseasesDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminDogDiseasesDb: listAdminDogDiseasesDbMock,
}));

describe("listAdminDogDiseases", () => {
  beforeEach(() => {
    listAdminDogDiseasesDbMock.mockReset();
  });

  it("returns unauthorized when the user is missing", async () => {
    await expect(listAdminDogDiseases({}, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(listAdminDogDiseasesDbMock).not.toHaveBeenCalled();
  });

  it("maps db rows and defaults the disease filter to Epi", async () => {
    listAdminDogDiseasesDbMock.mockResolvedValue({
      selectedDiseaseCode: "epi",
      total: 1,
      totalPages: 1,
      page: 1,
      diseaseOptions: [
        { diseaseCode: "epi", diseaseText: "Epilepsia", count: 174 },
      ],
      items: [
        {
          id: "row-1",
          evidenceKind: "DOG",
          diseaseCode: "epi",
          diseaseText: "Epilepsia",
          public: true,
          registrationNo: "FI12345/21",
          ekNo: 5588,
          sex: "FEMALE",
          name: "Metsapolun Kide",
          dogId: "dog-1",
          trialCount: 7,
          showCount: 4,
          sire: {
            registrationNo: "FI54321/20",
            name: "Korven Aatos",
          },
          dam: {
            registrationNo: "FI77777/18",
            name: "Havupolun Helmi",
          },
        },
      ],
    });

    await expect(
      listAdminDogDiseases(
        {
          page: 2,
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          selectedDiseaseCode: "epi",
          total: 1,
          totalPages: 1,
          page: 1,
          diseaseOptions: [
            { diseaseCode: "epi", diseaseText: "Epilepsia", count: 174 },
          ],
          items: [
            {
              id: "row-1",
              evidenceKind: "DOG",
              diseaseCode: "epi",
              diseaseText: "Epilepsia",
              public: true,
              registrationNo: "FI12345/21",
              ekNo: 5588,
              sex: "FEMALE",
              name: "Metsapolun Kide",
              dogId: "dog-1",
              trialCount: 7,
              showCount: 4,
              sire: {
                registrationNo: "FI54321/20",
                name: "Korven Aatos",
              },
              dam: {
                registrationNo: "FI77777/18",
                name: "Havupolun Helmi",
              },
            },
          ],
        },
      },
    });

    expect(listAdminDogDiseasesDbMock).toHaveBeenCalledWith({
      diseaseCode: undefined,
      page: 2,
      pageSize: 15,
    });
  });

  it("returns internal error when the db throws", async () => {
    listAdminDogDiseasesDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminDogDiseases(
        {},
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin dog diseases.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
