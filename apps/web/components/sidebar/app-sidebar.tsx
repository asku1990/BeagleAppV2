"use client";

import {
  Activity,
  Award,
  Dog,
  FileSearch,
  Flag,
  LogIn,
  PawPrint,
  Search,
  Shield,
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  { labelKey: "sidebar.nav.virtualPairing", icon: Activity },
  { labelKey: "sidebar.nav.bestDriver", icon: Shield },
];

export function AppSidebar() {
  const { t } = useI18n();

  const handleComingSoon = (item: string) => {
    toast(`${item}: ${t("common.notImplementedYet")}`);
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-[var(--beagle-border)]">
        <div className="flex min-h-12 items-center px-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="beagle-title text-lg">{t("sidebar.title")}</p>
          </div>
          <p className="hidden text-sm font-semibold text-[var(--beagle-ink)] group-data-[collapsible=icon]:block">
            {t("sidebar.shortTitle")}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.navigation")}</SidebarGroupLabel>
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

      <SidebarFooter className="mt-auto border-t border-[var(--beagle-border)]">
        <Button
          variant="ghost"
          className="justify-start gap-2 text-[var(--beagle-ink)] group-data-[collapsible=icon]:justify-center"
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
