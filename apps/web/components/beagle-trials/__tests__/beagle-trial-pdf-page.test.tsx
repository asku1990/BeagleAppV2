import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BeagleTrialPdfPage } from "../beagle-trial-pdf-page";

describe("BeagleTrialPdfPage", () => {
  it("renders the generated pdf shell for the trial entry", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialPdfPage, { trialId: "trial-1" }),
    );

    expect(html).toContain('data-trial-id="trial-1"');
    expect(html).toContain(
      'src="/api/trials/trial-1/pdf#page=1&amp;zoom=page-width"',
    );
    expect(html).toContain('title="AJOK koirakohtainen pöytäkirja"');
  });
});
