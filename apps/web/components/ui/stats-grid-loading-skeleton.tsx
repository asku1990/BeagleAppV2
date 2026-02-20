import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatsGridLoadingSkeletonProps = {
  cardCount?: number;
  rowsPerCard?: number[];
  cardClassName?: string;
  rowClassName?: string;
};

export function StatsGridLoadingSkeleton({
  cardCount = 3,
  rowsPerCard = [3, 3, 3],
  cardClassName,
  rowClassName,
}: StatsGridLoadingSkeletonProps) {
  return (
    <div
      className="grid gap-3 md:grid-cols-2 lg:gap-4 xl:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: cardCount }).map((_, cardIndex) => {
        const rowCount =
          rowsPerCard[cardIndex] ?? rowsPerCard[rowsPerCard.length - 1] ?? 3;

        return (
          <section key={cardIndex} className={cn("px-4 py-3.5", cardClassName)}>
            <Skeleton className="h-5 w-28" />
            <div className="mt-2.5 space-y-2.5">
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className={cn(
                    "grid grid-cols-[1fr_auto] items-center gap-3 border-b pb-2 last:border-b-0 last:pb-0",
                    rowClassName,
                  )}
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
