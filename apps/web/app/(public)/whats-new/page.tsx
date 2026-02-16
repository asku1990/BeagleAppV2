import { beagleTheme } from "@/components/ui/beagle-theme";
import { getReleaseNotesData } from "@/lib/release-notes";
import { cn } from "@/lib/utils";

const sectionLabelFi: Record<
  "Added" | "Changed" | "Fixed" | "Removed",
  string
> = {
  Added: "Lisätty",
  Changed: "Muutettu",
  Fixed: "Korjattu",
  Removed: "Poistettu",
};

export default async function WhatsNewPage() {
  const releaseNotesData = await getReleaseNotesData();
  const latestRelease = releaseNotesData.history[0];

  return (
    <>
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
          Mitä uutta
        </h1>
        {latestRelease ? (
          <p className={cn("mt-1 text-xs md:text-sm", beagleTheme.mutedText)}>
            Versio {latestRelease.version} ({latestRelease.date})
          </p>
        ) : null}
        <h2
          className={cn(
            "mt-3",
            beagleTheme.headingSm,
            beagleTheme.inkStrongText,
          )}
        >
          Uusimmat päivitykset
        </h2>
        <ul
          className={cn(
            "mt-2 list-disc space-y-1 pl-5 text-sm md:text-base",
            beagleTheme.inkText,
          )}
        >
          {releaseNotesData.latestUpdatesFi.slice(0, 5).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="mt-4">
          <a
            href="#full-release-notes"
            className={cn(
              "inline-flex items-center text-sm font-semibold underline underline-offset-2",
              beagleTheme.inkStrongText,
              beagleTheme.focusRing,
            )}
          >
            Lue lisää
          </a>
        </div>
      </header>

      <section
        id="full-release-notes"
        className={cn(
          beagleTheme.panel,
          "scroll-mt-16 px-5 py-5 md:px-6 md:py-6",
        )}
      >
        <h2 className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}>
          Kaikki muutokset
        </h2>

        <div className="mt-4 space-y-5">
          {releaseNotesData.history.map((release) => (
            <section key={`${release.version}-${release.date}`}>
              <h3
                className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}
              >
                v{release.version} ({release.date})
              </h3>
              <div className="mt-3 space-y-4">
                {release.blocks.map((block) => (
                  <section key={block.section}>
                    <h4
                      className={cn(
                        "text-sm font-semibold",
                        beagleTheme.inkStrongText,
                      )}
                    >
                      {sectionLabelFi[block.section]}
                    </h4>
                    <ul
                      className={cn(
                        "mt-2 list-disc space-y-2 pl-5 text-sm md:text-base",
                        beagleTheme.inkText,
                      )}
                    >
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
