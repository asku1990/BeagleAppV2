import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { useCalculateAdminDogInbreedingMutation } from "../use-calculate-admin-dog-inbreeding-mutation";

const { useMutationMock, calculateAdminDogInbreedingActionMock } = vi.hoisted(
  () => ({
    useMutationMock: vi.fn(),
    calculateAdminDogInbreedingActionMock: vi.fn(),
  }),
);

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
}));

vi.mock(
  "@/app/actions/admin/dogs/manage/calculate-admin-dog-inbreeding",
  () => ({
    calculateAdminDogInbreedingAction: calculateAdminDogInbreedingActionMock,
  }),
);

describe("useCalculateAdminDogInbreedingMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    calculateAdminDogInbreedingActionMock.mockReset();
  });

  it("calls calculate action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    calculateAdminDogInbreedingActionMock.mockResolvedValue({
      hasError: false,
      data: {
        inbreedingCoefficientPct: 12.5,
      },
    });

    useCalculateAdminDogInbreedingMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };
    const input = {
      sireRegistrationNo: "FI54321/20",
      damRegistrationNo: "FI77777/18",
    };

    await expect(options.mutationFn(input)).resolves.toEqual({
      inbreedingCoefficientPct: 12.5,
    });
    expect(calculateAdminDogInbreedingActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    calculateAdminDogInbreedingActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INVALID_SIRE_REGISTRATION",
      message: "Sire registration number was not found.",
    });

    useCalculateAdminDogInbreedingMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
      }),
    ).rejects.toMatchObject({
      name: "AdminMutationError",
      errorCode: "INVALID_SIRE_REGISTRATION",
    });
  });

  it("throws fallback error when action returns no data", async () => {
    useMutationMock.mockImplementation((options) => options);
    calculateAdminDogInbreedingActionMock.mockResolvedValue({
      hasError: false,
      data: null,
    });

    useCalculateAdminDogInbreedingMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
      }),
    ).rejects.toBeInstanceOf(AdminMutationError);
  });
});
