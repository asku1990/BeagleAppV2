import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BeagleTrialDetailsPageContainer } from "../beagle-trial-details-page-container";

const { useBeagleTrialDetailsQueryMock } = vi.hoisted(() => ({
  useBeagleTrialDetailsQueryMock: vi.fn(),
}));

vi.mock("@/queries/public/beagle/trials", () => ({
  useBeagleTrialDetailsQuery: useBeagleTrialDetailsQueryMock,
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "fi",
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, ...props }, children),
}));

describe("BeagleTrialDetailsPageContainer", () => {
  beforeEach(() => {
    useBeagleTrialDetailsQueryMock.mockReset();
    useBeagleTrialDetailsQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("renders invalid state when trial id is empty", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialDetailsPageContainer, { trialId: "   " }),
    );

    expect(html).toContain("trials.details.state.invalid.title");
    expect(useBeagleTrialDetailsQueryMock).toHaveBeenCalledWith("");
  });

  it("renders loading skeleton while query is loading", () => {
    useBeagleTrialDetailsQueryMock.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialDetailsPageContainer, {
        trialId: "trial_1",
      }),
    );

    expect(html).toContain('data-slot="skeleton"');
  });

  it("renders not-found state for 404 errors", () => {
    useBeagleTrialDetailsQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { status: 404, message: "Trial not found." },
    });

    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialDetailsPageContainer, {
        trialId: "trial_missing",
      }),
    );

    expect(html).toContain("trials.details.state.notFound.title");
  });

  it("renders details table when query succeeds", () => {
    useBeagleTrialDetailsQueryMock.mockReturnValue({
      data: {
        trial: {
          trialId: "trial_1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge Main",
          dogCount: 1,
        },
        items: [
          {
            id: "r_1",
            dogId: "dog_1",
            registrationNo: "FI-1/20",
            name: "Aatu",
            sex: "U",
            weather: "L",
            award: "Voi 1",
            classCode: "V",
            rank: "1",
            points: 88.5,
            judge: "Judge Main",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialDetailsPageContainer, {
        trialId: "trial_1",
      }),
    );

    expect(html).toContain("trials.details.title");
    expect(html).toContain("Helsinki");
    expect(html).toContain("FI-1/20");
    expect(html).toContain("Aatu");
    expect(html).toContain("88,5");
    expect(html).toContain('href="/beagle/dogs/dog_1"');
  });
});
