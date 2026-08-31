"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/hooks/i18n";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

export function BestDriverRulesDialog() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rules = ["one", "two", "three", "four", "five", "six"] as const;

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Info aria-hidden="true" />
        {t("bestDriver.rules.open")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-140">
          <DialogHeader>
            <DialogTitle>{t("bestDriver.rules.title")}</DialogTitle>
            <DialogDescription>{t("bestDriver.rules.intro")}</DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {rules.map((rule) => (
              <li key={rule}>{t(`bestDriver.rules.${rule}`)}</li>
            ))}
          </ol>
          <div className={cn("rounded-md p-3 text-sm", beagleTheme.softAccent)}>
            <p className="font-medium">{t("bestDriver.rules.exampleTitle")}</p>
            <p className={cn("mt-1", beagleTheme.mutedText)}>
              {t("bestDriver.rules.example")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
