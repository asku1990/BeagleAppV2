import type { ReactNode } from "react";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

export type AdvancedFilterPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function AdvancedFilterPanel({
  title,
  description,
  children,
  className,
}: AdvancedFilterPanelProps) {
  return (
    <section
      className={cn(
        "mt-4 rounded-lg border p-3",
        beagleTheme.border,
        className,
      )}
      aria-label={title}
    >
      <p className={cn("text-sm font-medium", beagleTheme.inkStrongText)}>
        {title}
      </p>
      {description ? (
        <p className={cn("mt-1 text-xs", beagleTheme.mutedText)}>
          {description}
        </p>
      ) : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}
