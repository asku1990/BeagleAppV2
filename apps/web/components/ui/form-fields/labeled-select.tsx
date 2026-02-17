import type { ComponentProps, ReactNode } from "react";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

export type LabeledSelectProps = Omit<ComponentProps<"select">, "children"> & {
  label: string;
  description?: string;
  children: ReactNode;
};

export function LabeledSelect({
  label,
  description,
  className,
  children,
  ...props
}: LabeledSelectProps) {
  return (
    <label className={cn("space-y-1 text-xs", className)}>
      <span className={beagleTheme.mutedText}>{label}</span>
      {description ? (
        <span className={cn("block text-xs", beagleTheme.mutedText)}>
          {description}
        </span>
      ) : null}
      <select
        className={cn(
          "h-9 w-full rounded-md border bg-white px-3 text-sm",
          beagleTheme.border,
          beagleTheme.focusRing,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
