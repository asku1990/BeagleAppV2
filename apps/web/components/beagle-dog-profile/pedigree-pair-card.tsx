import type { ReactNode } from "react";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

type PedigreePairCardProps = {
  sireLine: ReactNode;
  damLine: ReactNode;
  sireSrLabel: string;
  damSrLabel: string;
  className?: string;
};

export function PedigreePairCard({
  sireLine,
  damLine,
  sireSrLabel,
  damSrLabel,
  className,
}: PedigreePairCardProps) {
  return (
    <article
      className={cn(
        "w-72 shrink-0 rounded-md border px-3 py-2",
        beagleTheme.border,
        beagleTheme.surface,
        className,
      )}
    >
      <p
        className={cn(
          "font-mono text-[11px] leading-5",
          beagleTheme.inkStrongText,
        )}
      >
        <span className="sr-only">{sireSrLabel}</span>
        <span>{sireLine}</span>
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-[11px] leading-5",
          beagleTheme.inkStrongText,
        )}
      >
        <span className="sr-only">{damSrLabel}</span>
        <span>{damLine}</span>
      </p>
    </article>
  );
}
