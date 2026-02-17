import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

export type LabeledInputProps = ComponentProps<typeof Input> & {
  label: string;
  description?: string;
};

export function LabeledInput({
  label,
  description,
  className,
  ...props
}: LabeledInputProps) {
  return (
    <label className={cn("space-y-1 text-xs", className)}>
      <span className={beagleTheme.mutedText}>{label}</span>
      {description ? (
        <span className={cn("block text-xs", beagleTheme.mutedText)}>
          {description}
        </span>
      ) : null}
      <Input {...props} />
    </label>
  );
}
