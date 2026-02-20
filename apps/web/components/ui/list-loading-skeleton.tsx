import { Skeleton } from "@/components/ui/skeleton";

type ListLoadingSkeletonProps = {
  showSearchBar?: boolean;
  rows?: number;
  desktopRows?: number;
  mobileCards?: number;
};

export function ListLoadingSkeleton({
  showSearchBar = false,
  rows = 0,
  desktopRows = 5,
  mobileCards = 3,
}: ListLoadingSkeletonProps) {
  return (
    <div className="space-y-3" aria-busy="true">
      {showSearchBar ? <Skeleton className="h-9 w-full" /> : null}

      {rows > 0 ? (
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : null}

      {desktopRows > 0 ? (
        <div className="hidden space-y-2 md:block">
          {Array.from({ length: desktopRows }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : null}

      {mobileCards > 0 ? (
        <div className="space-y-3 md:hidden">
          {Array.from({ length: mobileCards }).map((_, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
