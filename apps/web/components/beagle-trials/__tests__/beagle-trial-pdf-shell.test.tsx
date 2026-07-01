import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getSharedPageWidth } from "../beagle-trial-pdf-canvas-stack";
import { BeagleTrialPdfShell } from "../beagle-trial-pdf-shell";

describe("BeagleTrialPdfShell", () => {
  function createPdfItems(count: number) {
    return Array.from({ length: count }, (_, index) => ({
      trialEntryId: `trial-${index + 1}`,
    }));
  }

  it("renders one pdf item with the shared canvas stack", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialPdfShell, {
        items: [{ trialEntryId: "trial-1" }],
      }),
    );

    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("trial-1/pdf#page=1");
    expect(html).toContain("flex w-full justify-center");
    expect(html).toContain("<canvas");
    expect(html).toContain('data-trial-entry-id="trial-1"');
  });

  it("renders all pdf items", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialPdfShell, {
        items: [{ trialEntryId: "trial-1" }, { trialEntryId: "trial-2" }],
      }),
    );

    expect(html).not.toContain("h-screen");
    expect(html).not.toContain("space-y-4");
    expect(html).not.toContain("trial-1/pdf#page=1");
    expect(html).toContain("flex w-full justify-center");
    expect(html).toContain("<canvas");
    expect(html).toContain('data-trial-entry-id="trial-1"');
    expect(html).toContain('data-trial-entry-id="trial-2"');
  });

  it("renders the first 10 pdf items and shows the reveal control for larger stacks", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialPdfShell, {
        items: createPdfItems(20),
      }),
    );

    expect(html).toContain('data-trial-entry-id="trial-1"');
    expect(html).toContain('data-trial-entry-id="trial-10"');
    expect(html).not.toContain('data-trial-entry-id="trial-11"');
    expect(html).toContain("Näytetään 10 / 20 pöytäkirjaa.");
    expect(html).toContain("Näytä lisää pöytäkirjoja");
  });

  it("renders all pdf items without reveal control when the stack fits the initial batch", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialPdfShell, {
        items: createPdfItems(10),
      }),
    );

    expect(html).toContain('data-trial-entry-id="trial-10"');
    expect(html).not.toContain("Näytä lisää pöytäkirjoja");
  });

  it("uses the widest loaded PDF after every requested item settles", () => {
    expect(
      getSharedPageWidth({
        items: [{ trialEntryId: "trial-1" }, { trialEntryId: "trial-2" }],
        pageWidths: { "trial-1": 595, "trial-2": 612 },
        failedTrialEntryIds: {},
      }),
    ).toBe(612);

    expect(
      getSharedPageWidth({
        items: [{ trialEntryId: "trial-1" }, { trialEntryId: "trial-stale" }],
        pageWidths: { "trial-1": 595 },
        failedTrialEntryIds: { "trial-stale": true },
      }),
    ).toBe(595);
  });

  it("waits for pending PDFs and ignores all-failed stacks", () => {
    expect(
      getSharedPageWidth({
        items: [{ trialEntryId: "trial-1" }, { trialEntryId: "trial-2" }],
        pageWidths: { "trial-1": 595 },
        failedTrialEntryIds: {},
      }),
    ).toBeNull();

    expect(
      getSharedPageWidth({
        items: [{ trialEntryId: "trial-1" }, { trialEntryId: "trial-2" }],
        pageWidths: {},
        failedTrialEntryIds: { "trial-1": true, "trial-2": true },
      }),
    ).toBeNull();
  });
});
