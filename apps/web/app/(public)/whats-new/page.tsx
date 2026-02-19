import { beagleTheme } from "@/components/ui/beagle-theme";
import { getReleaseNotesData } from "@/lib/release-notes";
import { cn } from "@/lib/utils";

const sectionLabelFi: Record<string, string> = {
  Added: "Lisätty",
  Changed: "Muutettu",
  Fixed: "Korjattu",
  Removed: "Poistettu",
};

export default async function WhatsNewPage() {
  const releaseNotesData = await getReleaseNotesData();

  return (
    <section
      className={cn(
        beagleTheme.panel,
        "scroll-mt-16 px-5 py-5 md:px-6 md:py-6",
      )}
    >
      <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
        Mitä uutta
      </h1>
      {releaseNotesData.history[0] ? (
        <p
          className={cn(
            "mt-1 text-sm font-semibold",
            beagleTheme.inkStrongText,
          )}
        >
          Nykyinen versio: v{releaseNotesData.history[0].version} (
          {releaseNotesData.history[0].date})
        </p>
      ) : null}
      <div className="mt-4">
        {releaseNotesData.history.map((release, index) => (
          <section
            key={`${release.version}-${release.date}`}
            className={cn(
              index > 0 ? "mt-6 border-t pt-6" : "",
              beagleTheme.border,
            )}
          >
            <h3
              className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}
            >
              v{release.version} ({release.date})
              {index === 0 ? " - käytössä nyt" : ""}
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
                    {sectionLabelFi[block.section] ?? block.section}
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
  );
}
