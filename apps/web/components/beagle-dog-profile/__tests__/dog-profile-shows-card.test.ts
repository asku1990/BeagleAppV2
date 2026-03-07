import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogProfileShowsCard } from "../dog-profile-shows-card";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    locale: "fi",
    t: (key: string) => key,
  }),
}));

describe("DogProfileShowsCard", () => {
  it("renders copy action when rows exist", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogProfileShowsCard, {
        rows: [
          {
            id: "show1",
            showId: "show-route-1",
            place: "Helsinki",
            date: "2024-01-01",
            result: "ERI",
            judge: "Judge",
            heightCm: 39,
          },
        ],
      }),
    );

    expect(html).toContain("dog.profile.shows.copy.button");
    expect(html).toContain('href="/beagle/shows/show-route-1"');
  });

  it("hides copy action when no rows exist", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogProfileShowsCard, {
        rows: [],
      }),
    );

    expect(html).not.toContain("dog.profile.shows.copy.button");
  });
});
