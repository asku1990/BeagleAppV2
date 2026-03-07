import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogProfileTrialsCard } from "../dog-profile-trials-card";

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

describe("DogProfileTrialsCard", () => {
  it("keeps source rank code unchanged", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogProfileTrialsCard, {
        rows: [
          {
            id: "trial1",
            trialId: "trial-route-1",
            place: "Turku",
            date: "2024-02-01",
            weather: "P",
            className: null,
            rank: "S1",
            points: 85.5,
            award: null,
            judge: null,
            haku: null,
            hauk: null,
            yva: null,
            hlo: null,
            alo: null,
            tja: null,
            pin: null,
          },
        ],
      }),
    );

    expect(html).toContain(">S1<");
    expect(html).toContain("dog.profile.trials.copy.button");
    expect(html).toContain('href="/beagle/trials/trial-route-1"');
  });

  it("keeps pair rank separator as pipe", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogProfileTrialsCard, {
        rows: [
          {
            id: "trial2",
            trialId: "trial-route-2",
            place: "Rovaniemi",
            date: "2024-02-01",
            weather: "P",
            className: null,
            rank: "8|12",
            points: 74.2,
            award: null,
            judge: null,
            haku: null,
            hauk: null,
            yva: null,
            hlo: null,
            alo: null,
            tja: null,
            pin: null,
          },
        ],
      }),
    );

    expect(html).toContain(">8|12<");
  });
});
