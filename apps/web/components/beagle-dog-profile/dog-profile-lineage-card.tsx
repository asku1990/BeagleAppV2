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

function formatPedigreeLine(
  parent: BeagleDogProfileParentDto | null,
  sexSymbol: "♂" | "♀",
  unknownLabel: string,
): { text: string; id: string | null; ekNo: number | null } {
  if (!parent) {
    return { text: `${sexSymbol} ${unknownLabel}`, id: null, ekNo: null };
  }

  if (!parent.registrationNo) {
    return {
      text: `${sexSymbol} - ${parent.name}`,
      id: parent.id ?? null,
      ekNo: parent.ekNo ?? null,
    };
  }

  return {
    text: `${sexSymbol} ${parent.registrationNo} ${parent.name}`,
    id: parent.id ?? null,
    ekNo: parent.ekNo ?? null,
  };
}

function renderPedigreeLine(line: {
  text: string;
  id: string | null;
  ekNo: number | null;
  shortEkLabel: string;
}): ReactNode {
  const ekSuffix =
    line.ekNo == null ? "" : ` (${line.shortEkLabel}: ${String(line.ekNo)})`;

  if (!line.id) {
    return `${line.text}${ekSuffix}`;
  }

  return (
    <>
      <Link
        className="underline-offset-2 hover:underline"
        href={getDogProfileHref(line.id)}
      >
        {line.text}
      </Link>
      {ekSuffix}
    </>
  );
}

export function DogProfileLineageCard({
  profile,
}: {
  profile: BeagleDogProfileDto;
}) {
  const { t, locale } = useI18n();
  const unknownLabel = t("dog.profile.sex.unknown");
  const shortEkLabel = locale === "sv" ? "SSB" : "EK";
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
        renderNode={(card) => {
          const sireLine = formatPedigreeLine(card.sire, "♂", unknownLabel);
          const damLine = formatPedigreeLine(card.dam, "♀", unknownLabel);

          return (
            <PedigreePairCard
              sireLine={renderPedigreeLine({ ...sireLine, shortEkLabel })}
              damLine={renderPedigreeLine({ ...damLine, shortEkLabel })}
              sireSrLabel={`${t("dog.profile.field.sire")}: `}
              damSrLabel={`${t("dog.profile.field.dam")}: `}
            />
          );
        }}
      />
    </ListingSectionShell>
  );
}
