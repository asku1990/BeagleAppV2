import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ListingResponsiveResults({
  desktop,
  mobile,
  desktopClassName,
  mobileClassName,
}: {
  desktop: ReactNode;
  mobile: ReactNode;
  desktopClassName?: string;
  mobileClassName?: string;
}) {
  return (
    <>
      <div className={cn("hidden md:block", desktopClassName)}>{desktop}</div>
      <div className={cn("md:hidden", mobileClassName)}>{mobile}</div>
    </>
  );
}
