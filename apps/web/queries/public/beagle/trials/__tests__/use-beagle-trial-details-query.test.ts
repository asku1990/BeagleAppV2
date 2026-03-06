import { beforeEach, describe, expect, it, vi } from "vitest";
import { beagleTrialDetailsQueryKey } from "../query-keys";
import { useBeagleTrialDetailsQuery } from "../use-beagle-trial-details-query";

const { useQueryMock, getBeagleTrialDetailsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getBeagleTrialDetailsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/public/beagle/trials/get-trial-details", () => ({
  getBeagleTrialDetailsAction: getBeagleTrialDetailsActionMock,
}));

describe("useBeagleTrialDetailsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getBeagleTrialDetailsActionMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleTrialDetailsQuery(" s_1 ");

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(beagleTrialDetailsQueryKey("s_1"));
    expect(options.staleTime).toBe(1000 * 60 * 5);
    expect(options.enabled).toBe(true);
  });

  it("is disabled when trial id is missing", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleTrialDetailsQuery("   ");

    const options = useQueryMock.mock.calls[0]?.[0] as {
      enabled: boolean;
    };
    expect(options.enabled).toBe(false);
  });

  it("returns trial details from queryFn when action succeeds", async () => {
    const trialDetails = {
      trialId: "s_1",
      registrationNumber: "ABC-123",
    };
    getBeagleTrialDetailsActionMock.mockResolvedValue({
      hasError: false,
      status: 200,
      data: trialDetails,
      error: null,
    });
    useQueryMock.mockImplementation((options) => options);

    useBeagleTrialDetailsQuery(" s_1 ");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(trialDetails);
    expect(getBeagleTrialDetailsActionMock).toHaveBeenCalledWith("s_1");
  });

  it("throws action error from queryFn when action fails", async () => {
    getBeagleTrialDetailsActionMock.mockResolvedValue({
      hasError: true,
      status: 500,
      data: null,
      error: "Backend exploded",
    });
    useQueryMock.mockImplementation((options) => options);

    useBeagleTrialDetailsQuery("s_1");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      name: "BeagleTrialDetailsQueryError",
      message: "Backend exploded",
      status: 500,
    });
  });

  it("throws default message from queryFn when action fails without error message", async () => {
    getBeagleTrialDetailsActionMock.mockResolvedValue({
      hasError: false,
      status: 404,
      data: null,
      error: null,
    });
    useQueryMock.mockImplementation((options) => options);

    useBeagleTrialDetailsQuery("s_1");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      name: "BeagleTrialDetailsQueryError",
      message: "Failed to load trial details.",
      status: 404,
    });
  });
});
