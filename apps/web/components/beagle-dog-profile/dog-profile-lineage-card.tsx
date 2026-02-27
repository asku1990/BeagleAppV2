import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type {
  BeagleDogProfileDto,
  BeagleDogProfileParentDto,
} from "@beagle/contracts";
import { cn } from "@/lib/utils";
import { PedigreePairCard } from "./pedigree-pair-card";
import { PedigreeTree } from "./pedigree-tree";

const FALLBACK_VALUE = "-";

function formatPedigreeLine(
  parent: BeagleDogProfileParentDto | null,
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

export function DogProfileLineageCard({
  profile,
}: {
  profile: BeagleDogProfileDto;
}) {
  const { t } = useI18n();
  const generations = profile.pedigree.map((generation) => ({
    generation: generation.generation,
    label: null,
    nodes: generation.cards,
  }));

  return (
    <ListingSectionShell title={t("dog.profile.card.lineage.title")}>
      <PedigreeTree
        generations={generations}
        getNodeKey={(card) => card.id}
        labelClassName={cn(
          "text-center text-xs font-semibold",
          beagleTheme.mutedText,
        )}
        renderNode={(card) => (
          <PedigreePairCard
            sireLine={formatPedigreeLine(card.sire, "♂")}
            damLine={formatPedigreeLine(card.dam, "♀")}
            sireSrLabel={`${t("dog.profile.field.sire")}: `}
            damSrLabel={`${t("dog.profile.field.dam")}: `}
          />
        )}
      />
    </ListingSectionShell>
  );
}
