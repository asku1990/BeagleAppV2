import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { BeagleTrialPdfCollectionPageMock } = vi.hoisted(() => ({
  BeagleTrialPdfCollectionPageMock: vi.fn(),
}));

vi.mock("@/components/beagle-trials", () => ({
  BeagleTrialPdfCollectionPage: BeagleTrialPdfCollectionPageMock,
}));

import BeagleTrialPdfCollectionRoute from "../page";

describe("beagle trial pdf collection route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes a single trial entry id query param to the pdf collection page", async () => {
    BeagleTrialPdfCollectionPageMock.mockImplementation(
      ({ trialEntryIds }: { trialEntryIds: string[] }) =>
        `entries:${trialEntryIds.join(",")}`,
    );

    const element = await BeagleTrialPdfCollectionRoute({
      searchParams: Promise.resolve({
        trialEntryId: "entry_1",
      }),
    });
    const html = renderToStaticMarkup(element as React.ReactElement);

    expect(BeagleTrialPdfCollectionPageMock).toHaveBeenCalledWith(
      { trialEntryIds: ["entry_1"] },
      undefined,
    );
    expect(html).toContain("entries:entry_1");
  });

  it("passes repeated trial entry id query params to the pdf collection page", async () => {
    BeagleTrialPdfCollectionPageMock.mockImplementation(
      ({ trialEntryIds }: { trialEntryIds: string[] }) =>
        `entries:${trialEntryIds.join(",")}`,
    );

    const element = await BeagleTrialPdfCollectionRoute({
      searchParams: Promise.resolve({
        trialEntryId: ["entry_1", "entry_2"],
      }),
    });
    const html = renderToStaticMarkup(element as React.ReactElement);

    expect(BeagleTrialPdfCollectionPageMock).toHaveBeenCalledWith(
      { trialEntryIds: ["entry_1", "entry_2"] },
      undefined,
    );
    expect(html).toContain("entries:entry_1,entry_2");
  });
});
