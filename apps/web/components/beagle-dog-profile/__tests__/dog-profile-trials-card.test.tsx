import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogProfileTrialsCard } from "../dog-profile-trials-card";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    locale: "fi",
    t: (key: string) => key,
  }),
}));

describe("DogProfileTrialsCard", () => {
  it("formats source rank code for readability", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogProfileTrialsCard, {
        rows: [
          {
            id: "trial1",
            place: "Turku",
            date: "2024-02-01",
            weather: "P",
            className: null,
            rank: "S1",
            points: 85.5,
            award: null,
          },
        ],
      }),
    );

    expect(html).toContain("1.");
    expect(html).not.toContain(">S1<");
  });

  it("formats pair rank using slash separator", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogProfileTrialsCard, {
        rows: [
          {
            id: "trial2",
            place: "Rovaniemi",
            date: "2024-02-01",
            weather: "P",
            className: null,
            rank: "8|12",
            points: 74.2,
            award: null,
          },
        ],
      }),
    );

    expect(html).toContain("8/12");
    expect(html).not.toContain(">8|12<");
  });
});
