import type { ComponentProps } from "react";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

export type LabeledCheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: string;
  description?: string;
};

export function LabeledCheckbox({
  label,
  description,
  className,
  ...props
}: LabeledCheckboxProps) {
  return (
    <label className={cn("flex items-center gap-2 text-xs", className)}>
      <input
        type="checkbox"
        className={cn(
          "size-4 rounded border",
          beagleTheme.border,
          beagleTheme.focusRing,
        )}
        {...props}
      />
      <span className={beagleTheme.inkStrongText}>{label}</span>
      {description ? (
        <span className={cn("text-xs", beagleTheme.mutedText)}>
          {description}
        </span>
      ) : null}
    </label>
  );
}
