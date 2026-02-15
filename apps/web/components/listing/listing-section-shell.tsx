import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

export function ListingSectionShell({
  title,
  subtitle,
  count,
  children,
  className,
  contentClassName,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  count?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn(beagleTheme.panel, "gap-0 py-0", className)}>
      <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
        <CardTitle
          className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
        >
          {title}
        </CardTitle>
        {subtitle ? (
          <p className={cn("text-sm", beagleTheme.mutedText)}>{subtitle}</p>
        ) : null}
        {count ? (
          <p className={cn("text-sm", beagleTheme.mutedText)}>{count}</p>
        ) : null}
      </CardHeader>
      <CardContent
        className={cn("px-5 pb-5 md:px-6 md:pb-6", contentClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
}
