import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogProfileTrialsLaajaPage } from "../dog-profile-trials-laaja-page";

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

describe("DogProfileTrialsLaajaPage", () => {
  it("renders all trial rows and full metric columns", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogProfileTrialsLaajaPage, {
        profile: {
          id: "dog_1",
          name: "Ajometsan Aada",
          registrationNo: "FI-11/24",
          trials: [
            {
              id: "trial1",
              trialId: "trial-route-1",
              place: "Turku",
              date: "2024-02-01",
              weather: "P",
              koetyyppi: "NORMAL",
              koiriaLuokassa: 12,
              rank: "1",
              points: 85.5,
              award: "Beaj 1",
              judge: "Judge A",
              haku: 4,
              hauk: 4,
              yva: 4,
              hlo: 0,
              alo: 0,
              tja: 0,
              pin: 8,
            },
          ],
        },
      }),
    );

    expect(html).toContain("dog.profile.trials.laaja.title");
    expect(html).toContain("dog.profile.trials.laaja.section.title");
    expect(html).toContain("dog.profile.count.entries");
    expect(html).toContain("dog.profile.trials.col.place");
    expect(html).toContain("trials.details.copy.col.searchWork");
    expect(html).toContain("trials.details.copy.col.obstacleWork");
    expect(html).toContain('href="/beagle/trials/trial-route-1"');
    expect(html).toContain("1 / 12");
    expect(html).toContain("85.50");
    expect(html).toContain("4.00");
    expect(html).toContain("Judge A");
  });
});
