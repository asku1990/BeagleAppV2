import { ListLoadingSkeleton } from "@/components/ui/list-loading-skeleton";

export function BeagleSearchLoadingState() {
  return <ListLoadingSkeleton rows={5} desktopRows={0} mobileCards={0} />;
}
