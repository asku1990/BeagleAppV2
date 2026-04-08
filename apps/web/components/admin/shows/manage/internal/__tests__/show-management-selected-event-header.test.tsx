import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) =>
    React.createElement("button", { type: "button" }, children),
}));

import { ShowManagementSelectedEventHeader } from "../show-management-selected-event-header";

describe("ShowManagementSelectedEventHeader", () => {
  it("renders the full selected-event metadata", () => {
    const html = renderToStaticMarkup(
      React.createElement(ShowManagementSelectedEventHeader, {
        selectedEvent: {
          id: "event-1",
          eventDate: "2025-10-25",
          eventPlace: "Seinäjoki Areena",
          eventCity: "Seinäjoki",
          eventName: "Autumn Show",
          eventType: "A",
          organizer: "Club",
          judge: "Judge",
          entries: [],
        },
        isEditDisabled: false,
        onEdit: vi.fn(),
      }),
    );

    expect(html).toContain("Selected event");
    expect(html).toContain("Seinäjoki Areena");
    expect(html).toContain("Date:");
    expect(html).toContain("City:");
    expect(html).toContain("Event:");
    expect(html).toContain("Type:");
    expect(html).toContain("Organizer:");
    expect(html).toContain("Judge:");
    expect(html).toContain("Dogs:");
    expect(html).toContain("2025-10-25");
    expect(html).toContain("Seinäjoki");
    expect(html).toContain("Autumn Show");
  });
});
