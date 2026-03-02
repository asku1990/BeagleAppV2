import { ListingSectionShell } from "@/components/listing";
import Link from "next/link";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { getDogProfileHref } from "@/lib/public/beagle/dogs/profile";
import type {
  BeagleDogProfileDto,
  BeagleDogProfileParentDto,
} from "@beagle/contracts";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PedigreePairCard } from "./pedigree-pair-card";
import { PedigreeTree } from "./pedigree-tree";

const FALLBACK_VALUE = "-";

function formatPedigreeLine(
  parent: BeagleDogProfileParentDto | null,
  sexSymbol: "♂" | "♀",
): { text: string; id: string | null } {
  if (!parent) {
    return { text: `${sexSymbol} ${FALLBACK_VALUE}`, id: null };
  }

  if (!parent.registrationNo) {
    return {
      text: `${sexSymbol} ${FALLBACK_VALUE} ${parent.name}`,
      id: parent.id ?? null,
    };
  }

  return {
    text: `${sexSymbol} ${parent.registrationNo} ${parent.name}`,
    id: parent.id ?? null,
  };
}

function renderPedigreeLine(line: {
  text: string;
  id: string | null;
}): ReactNode {
  if (!line.id) {
    return line.text;
  }

  return (
    <Link
      className="underline-offset-2 hover:underline"
      href={getDogProfileHref(line.id)}
    >
      {line.text}
    </Link>
  );
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
            sireLine={renderPedigreeLine(formatPedigreeLine(card.sire, "♂"))}
            damLine={renderPedigreeLine(formatPedigreeLine(card.dam, "♀"))}
            sireSrLabel={`${t("dog.profile.field.sire")}: `}
            damSrLabel={`${t("dog.profile.field.dam")}: `}
          />
        )}
      />
    </ListingSectionShell>
  );
}
