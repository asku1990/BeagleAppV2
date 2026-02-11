import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-[var(--beagle-border)]/85",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[beagle-shimmer_1.4s_ease-in-out_infinite]",
        "before:bg-linear-to-r before:from-transparent before:via-white/75 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
