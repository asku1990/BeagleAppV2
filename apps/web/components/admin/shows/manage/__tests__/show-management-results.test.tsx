import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/listing", () => ({
  ListingResponsiveResults: ({
    desktop,
    mobile,
  }: {
    desktop: React.ReactNode;
    mobile: React.ReactNode;
  }) => React.createElement(React.Fragment, null, desktop, mobile),
}));

vi.mock("@/components/ui/card", () => ({
  Card: (props: React.ComponentProps<"div">) =>
    React.createElement("div", props, props.children),
  CardContent: (props: React.ComponentProps<"div">) =>
    React.createElement("div", props, props.children),
}));

import { ShowManagementResults } from "../show-management-results";

describe("ShowManagementResults", () => {
  it("renders the full event summary in both layouts", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowManagementResults, {
        events: [
          {
            showId: "show-1",
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            eventCity: "Helsinki",
            eventName: "Summer Show",
            eventType: "A",
            organizer: "Beagle Club",
            judge: "Judge",
            dogCount: 1,
          },
        ],
        selectedEventId: undefined,
        onSelectEvent: vi.fn(),
      }),
    );

    expect(html).toContain("Helsinki");
    expect(html).toContain("2025-06-01");
    expect(html).toContain("Summer Show");
    expect(html).toContain("Date:");
    expect(html).toContain("Place:");
    expect(html).toContain("City:");
    expect(html).toContain("Type:");
    expect(html).toContain("Event:");
    expect(html).toContain("Organizer:");
    expect(html).toContain("Judge:");
    expect(html).toContain("Dogs:");
  });
});
