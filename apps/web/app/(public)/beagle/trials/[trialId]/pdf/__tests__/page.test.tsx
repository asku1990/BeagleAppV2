import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { BeagleTrialPdfPageMock } = vi.hoisted(() => ({
  BeagleTrialPdfPageMock: vi.fn(({ trialId }: { trialId: string }) =>
    React.createElement("section", { "data-trial-id": trialId }),
  ),
}));

vi.mock("@/components/beagle-trials", () => ({
  BeagleTrialPdfPage: BeagleTrialPdfPageMock,
}));

describe("beagle trial pdf route", () => {
  it("passes the trial id to the pdf page", async () => {
    const { default: BeagleTrialPdfRoute } = await import("../page");
    const html = renderToStaticMarkup(
      await BeagleTrialPdfRoute({
        params: Promise.resolve({ trialId: "trial-1" }),
      }),
    );

    expect(html).toContain('data-trial-id="trial-1"');
    expect(BeagleTrialPdfPageMock).toHaveBeenCalledWith(
      { trialId: "trial-1" },
      undefined,
    );
  });
});
