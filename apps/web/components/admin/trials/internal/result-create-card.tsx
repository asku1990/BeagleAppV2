import React from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function ResultCreateCard({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
}: Props) {
  const contentId = `${id}-content`;
  return (
    <Card>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
      >
        <span>
          <span className="block font-semibold">{title}</span>
          {!open && summary ? (
            <span className="mt-1 block text-sm text-muted-foreground">
              {summary}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <CardContent id={contentId} className="border-t p-5">
          {children}
        </CardContent>
      ) : null}
    </Card>
  );
}
