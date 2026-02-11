"use client";

import {
  Award,
  Dog,
  FileSearch,
  Flag,
  Link2,
  LogIn,
  PawPrint,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useI18n, type MessageKey } from "@/lib/i18n";

type NavItem = {
  labelKey: MessageKey;
  icon: React.ComponentType<{ className?: string }>;
};

const publicNavItems: NavItem[] = [
  { labelKey: "sidebar.nav.beagleSearch", icon: Search },
  { labelKey: "sidebar.nav.ownerSearch", icon: Users },
  { labelKey: "sidebar.nav.trialResults", icon: FileSearch },
  { labelKey: "sidebar.nav.fieldTrials", icon: Flag },
  { labelKey: "sidebar.nav.shows", icon: Award },
  { labelKey: "sidebar.nav.ekDogs", icon: Dog },
  { labelKey: "sidebar.nav.kennelNames", icon: PawPrint },
  { labelKey: "sidebar.nav.virtualPairing", icon: Link2 },
  { labelKey: "sidebar.nav.bestDriver", icon: Trophy },
];

export function AppSidebar() {
  const { t } = useI18n();
  const { state } = useSidebar();

  const handleComingSoon = (item: string) => {
    toast(`${item}: ${t("common.notImplementedYet")}`);
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="gap-0 border-b border-[var(--beagle-border)] p-0">
        <div
          className={
            state === "collapsed"
              ? "flex h-12 items-center justify-center px-0"
              : "flex h-12 items-center px-3"
          }
        >
          {state === "collapsed" ? (
            <p className="text-xs font-semibold leading-none tracking-wide text-[var(--beagle-ink)] uppercase">
              {t("sidebar.shortTitle")}
            </p>
          ) : (
            <p className="text-base font-semibold leading-none text-[var(--beagle-ink)]">
              {t("sidebar.title")}
            </p>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {publicNavItems.map((item) => (
                <SidebarMenuItem key={item.labelKey}>
                  <SidebarMenuButton
                    tooltip={t(item.labelKey)}
                    onClick={() => handleComingSoon(t(item.labelKey))}
                    className="text-[var(--beagle-ink)]"
                  >
                    <item.icon className="size-4" />
                    <span>{t(item.labelKey)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-[var(--beagle-border)] group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <Button
          variant="ghost"
          className="justify-start gap-2 text-[var(--beagle-ink)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={() => handleComingSoon(t("sidebar.signIn"))}
        >
          <LogIn className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            {t("sidebar.signIn")}
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
