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

    expect(html).toContain("Valittu tapahtuma");
    expect(html).toContain("Seinäjoki Areena");
    expect(html).toContain("Päivä:");
    expect(html).toContain("Kaupunki:");
    expect(html).toContain("Tapahtuma:");
    expect(html).toContain("Tyyppi:");
    expect(html).toContain("Järjestäjä:");
    expect(html).toContain("Tuomari:");
    expect(html).toContain("Koiria:");
    expect(html).toContain("25.10.2025");
    expect(html).toContain("Seinäjoki");
    expect(html).toContain("Autumn Show");
  });
});
