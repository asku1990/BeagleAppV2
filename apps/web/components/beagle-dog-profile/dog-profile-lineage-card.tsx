import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type { DogProfile } from "@/lib/beagle-dogs";
import { cn } from "@/lib/utils";

const FALLBACK_VALUE = "-";

function formatPedigreeLine(
  parent: DogProfile["sire"],
  sexSymbol: "♂" | "♀",
): string {
  if (!parent) {
    return `${sexSymbol} ${FALLBACK_VALUE}`;
  }

  if (!parent.registrationNo) {
    return `${sexSymbol} ${FALLBACK_VALUE} ${parent.name}`;
  }

  return `${sexSymbol} ${parent.registrationNo} ${parent.name}`;
}

export function DogProfileLineageCard({ profile }: { profile: DogProfile }) {
  const { t } = useI18n();
  const maxCardsPerGeneration = Math.max(
    ...profile.pedigree.map((generation) => generation.cards.length),
    1,
  );
  const cardHeight = 72;
  const cardGap = 12;
  const columnMinHeight =
    maxCardsPerGeneration * cardHeight + (maxCardsPerGeneration - 1) * cardGap;

  return (
    <ListingSectionShell title={t("dog.profile.card.lineage.title")}>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-[860px] items-start justify-center gap-4">
          {profile.pedigree.map((generation) => (
            <section
              key={generation.generation}
              className="w-72 shrink-0 space-y-2"
            >
              <h3
                className={cn(
                  "text-center text-xs font-semibold",
                  beagleTheme.mutedText,
                )}
              >
                {t("dog.profile.lineage.generationLabel")}{" "}
                {generation.generation}
              </h3>

              <div
                className="flex flex-col justify-center gap-3"
                style={{ minHeight: `${columnMinHeight}px` }}
              >
                {generation.cards.map((card) => (
                  <article
                    key={card.id}
                    className={cn(
                      "w-72 shrink-0 rounded-md border px-3 py-2",
                      beagleTheme.border,
                      beagleTheme.surface,
                    )}
                  >
                    <p
                      className={cn(
                        "font-mono text-[11px] leading-5",
                        beagleTheme.inkStrongText,
                      )}
                    >
                      <span className="sr-only">
                        {t("dog.profile.field.sire")}:{" "}
                      </span>
                      <span>{formatPedigreeLine(card.sire, "♂")}</span>
                    </p>
                    <p
                      className={cn(
                        "mt-1 font-mono text-[11px] leading-5",
                        beagleTheme.inkStrongText,
                      )}
                    >
                      <span className="sr-only">
                        {t("dog.profile.field.dam")}:{" "}
                      </span>
                      <span>{formatPedigreeLine(card.dam, "♀")}</span>
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </ListingSectionShell>
  );
}
