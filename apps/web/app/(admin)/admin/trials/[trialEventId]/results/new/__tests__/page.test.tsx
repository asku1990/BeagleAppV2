import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Page from "../page";

vi.mock(
  "@/components/admin/trials/admin-trial-entry-create-page-client",
  () => ({
    AdminTrialEntryCreatePageClient: ({
      trialEventId,
    }: {
      trialEventId: string;
    }) => React.createElement("div", null, trialEventId),
  }),
);

describe("manual trial result create page", () => {
  it("passes the route event id to the client workflow", async () => {
    const html = renderToStaticMarkup(
      await Page({ params: Promise.resolve({ trialEventId: "event-1" }) }),
    );
    expect(html).toContain("event-1");
  });
});
