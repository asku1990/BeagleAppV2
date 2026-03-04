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

type PedigreeLine = {
  id: string | null;
  ekNo: number | null;
  sexSymbol: "♂" | "♀";
  registrationNo: string | null;
  name: string | null;
  unknownLabel: string;
};

function formatPedigreeLine(
  parent: BeagleDogProfileParentDto | null,
  sexSymbol: "♂" | "♀",
  unknownLabel: string,
): PedigreeLine {
  if (!parent) {
    return {
      id: null,
      ekNo: null,
      sexSymbol,
      registrationNo: null,
      name: null,
      unknownLabel,
    };
  }

  return {
    id: parent.id ?? null,
    ekNo: parent.ekNo ?? null,
    sexSymbol,
    registrationNo: parent.registrationNo ?? null,
    name: parent.name,
    unknownLabel,
  };
}

function renderPedigreeLineText(line: PedigreeLine): ReactNode {
  if (!line.name) {
    return `${line.sexSymbol} ${line.unknownLabel}`;
  }

  if (!line.registrationNo) {
    return (
      <>
        {`${line.sexSymbol} - `}
        <span className="font-semibold">{line.name}</span>
      </>
    );
  }

  return (
    <>
      {`${line.sexSymbol} ${line.registrationNo} `}
      <span className="font-semibold">{line.name}</span>
    </>
  );
}

function renderPedigreeLine(
  line: PedigreeLine & {
    shortEkLabel: string;
  },
): ReactNode {
  const lineText = renderPedigreeLineText(line);
  const ekSuffix =
    line.ekNo == null ? "" : ` (${line.shortEkLabel}: ${String(line.ekNo)})`;

  if (!line.id) {
    return (
      <>
        {lineText}
        {ekSuffix}
      </>
    );
  }

  return (
    <>
      <Link
        className="underline-offset-2 hover:underline"
        href={getDogProfileHref(line.id)}
      >
        {lineText}
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
