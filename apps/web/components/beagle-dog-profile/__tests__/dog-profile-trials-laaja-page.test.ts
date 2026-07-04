import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogProfileTrialsLaajaPage } from "../dog-profile-trials-laaja-page";
import { DogProfileTrialsLaajaTable } from "../dog-profile-trials-laaja-table";

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
  it("renders all trial rows and the pdf stack button when supported", () => {
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
              trialEntryId: "trial-entry-1",
              trialRuleWindowId: "trw_post_20230801",
              hasDogTrialPdf: true,
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
              eras: [
                {
                  era: 1,
                  alkoi: "08:15",
                  hakumin: 35,
                  ajomin: 120,
                  haku: 4,
                  hauk: 4.5,
                  yva: 4.25,
                  hlo: 0,
                  alo: 0,
                  tja: 0.5,
                  pin: 8,
                  huomautusTeksti: "Hyvä erä",
                },
              ],
            },
            {
              id: "trial2",
              trialId: "trial-route-2",
              trialEntryId: "trial-entry-2",
              trialRuleWindowId: "trw_pre_20020801",
              hasDogTrialPdf: false,
              place: "Helsinki",
              date: "2024-02-02",
              weather: "P",
              koetyyppi: "NORMAL",
              koiriaLuokassa: null,
              rank: null,
              points: null,
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
        },
      }),
    );

    expect(html).toContain("dog.profile.trials.laaja.title");
    expect(html).toContain("dog.profile.trials.laaja.section.title");
    expect(html).toContain("dog.profile.count.entries");
    expect(html).toContain("dog.profile.trials.openPdfStack");
    expect(html).toContain("dog.profile.trials.col.place");
    expect(html).toContain("trials.details.copy.col.searchWork");
    expect(html).toContain("trials.details.copy.col.obstacleWork");
    expect(html).toContain("dog.profile.trials.eras.show");
    expect(html.match(/dog\.profile\.trials\.eras\.show/g)).toHaveLength(1);
    expect(html).not.toContain("dog.profile.trials.eras.hide");
    expect(html).not.toContain("Hyvä erä");
    expect(html).toContain('href="/beagle/trials/trial-route-1"');
    expect(html).toContain(
      'href="/beagle/trials/pdf?trialEntryId=trial-entry-1"',
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer"');
    expect(html).not.toContain("trial-entry-2");
    expect(html).toContain("1 / 12");
    expect(html).toContain("85.50");
    expect(html).toContain("4.00");
    expect(html).toContain("Judge A");
  });

  it("renders expanded era rows as compact v1-style child rows", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogProfileTrialsLaajaTable, {
        showEraDetails: true,
        rows: [
          {
            id: "trial1",
            trialId: "trial-route-1",
            trialEntryId: "trial-entry-1",
            trialRuleWindowId: "trw_post_20230801",
            hasDogTrialPdf: true,
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
            eras: [
              {
                era: 1,
                alkoi: "08:15",
                hakumin: 35,
                ajomin: 120,
                haku: 4,
                hauk: 4.5,
                yva: 4.25,
                hlo: 0,
                alo: 0,
                tja: 0.5,
                pin: 8,
                huomautusTeksti: "Hyvä erä",
              },
            ],
          },
          {
            id: "trial2",
            trialId: "trial-route-2",
            trialEntryId: "trial-entry-2",
            trialRuleWindowId: "trw_post_20230801",
            hasDogTrialPdf: false,
            place: "Tampere",
            date: "2024-02-02",
            weather: null,
            koetyyppi: "NORMAL",
            koiriaLuokassa: null,
            rank: null,
            points: null,
            award: null,
            judge: null,
            haku: null,
            hauk: null,
            yva: null,
            hlo: null,
            alo: null,
            tja: null,
            pin: null,
            eras: [
              {
                era: 1,
                alkoi: null,
                hakumin: 25,
                ajomin: 95,
                haku: null,
                hauk: null,
                yva: null,
                hlo: null,
                alo: null,
                tja: null,
                pin: null,
                huomautusTeksti: null,
              },
            ],
          },
        ],
      }),
    );

    const desktopHtml = html.split('<div class="md:hidden">')[0];
    const mobileHtml = html.split('<div class="md:hidden">')[1] ?? "";

    expect(desktopHtml).not.toContain("dog.profile.trials.eras.total");
    expect(desktopHtml).toContain("dog.profile.trials.eras.col.era: 1.");
    expect(desktopHtml).toContain("dog.profile.trials.eras.col.alkoi: 08:15");
    expect(desktopHtml).toContain("dog.profile.trials.eras.col.hakumin: 35");
    expect(desktopHtml).toContain("dog.profile.trials.eras.col.ajomin: 120");
    expect(desktopHtml).toContain("dog.profile.trials.col.weather");
    expect(desktopHtml).toContain("dog.profile.trials.col.class");
    expect(desktopHtml).toContain("dog.profile.trials.col.rank");
    expect(desktopHtml).toContain("dog.profile.trials.col.points");
    expect(desktopHtml).toContain("dog.profile.trials.eras.col.hakumin: 25");
    expect(desktopHtml).toContain("dog.profile.trials.eras.col.ajomin: 95");
    expect(desktopHtml).toContain("dog.profile.trials.eras.col.huomautus");
    expect(desktopHtml).toContain("Hyvä erä");
    expect(desktopHtml).toContain("4.50");
    expect(desktopHtml).toContain("4.25");
    expect(desktopHtml).toContain("0.50");
    expect(mobileHtml).toContain("dog.profile.trials.col.weather");
    expect(mobileHtml).toContain("dog.profile.trials.col.class");
    expect(mobileHtml).toContain("dog.profile.trials.col.rank");
    expect(mobileHtml).toContain("dog.profile.trials.col.points");
    expect(mobileHtml).toContain("trials.details.copy.col.searchWork");
    expect(mobileHtml).toContain("trials.details.copy.col.barking");
    expect(mobileHtml).toContain("trials.details.copy.col.ajotaito");
    expect(mobileHtml).toContain(
      "trials.details.copy.col.searchLoosenessPenalty",
    );
    expect(mobileHtml).toContain(
      "trials.details.copy.col.chaseLoosenessPenalty",
    );
    expect(mobileHtml).toContain("trials.details.col.judge");
    expect(mobileHtml).toContain("dog.profile.trials.eras.col.alkoi");
    expect(mobileHtml).toContain("dog.profile.trials.eras.col.hakumin");
    expect(mobileHtml).toContain("dog.profile.trials.eras.col.ajomin");

    const firstEraRowHtml =
      [...desktopHtml.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/g)]
        .map((match) => match[0])
        .find((rowHtml) => rowHtml.includes("Hyvä erä")) ?? "";
    const firstEraCells = [...firstEraRowHtml.matchAll(/<td/g)];

    expect(firstEraCells).toHaveLength(16);
    expect(firstEraRowHtml).toMatch(
      /0\.00<\/td><td class="px-2 py-2"><\/td><td class="px-2 py-2">Hyvä erä<\/td><td class="px-2 py-2">0\.50<\/td><td class="px-2 py-2">8\.00<\/td>/,
    );
  });
});
