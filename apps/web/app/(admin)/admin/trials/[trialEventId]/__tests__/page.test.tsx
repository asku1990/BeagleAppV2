import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AdminTrialEventWorkspacePage from "../page";

vi.mock("@/components/admin/trials", () => ({
  AdminTrialEventWorkspacePageClient: ({
    trialEventId,
  }: {
    trialEventId: string;
  }) => React.createElement("div", null, trialEventId),
}));

describe("AdminTrialEventWorkspacePage", () => {
  it("forwards the route trial event id", async () => {
    const page = await AdminTrialEventWorkspacePage({
      params: Promise.resolve({ trialEventId: "event-1" }),
    });

    expect(renderToStaticMarkup(page)).toContain("event-1");
  });
});
