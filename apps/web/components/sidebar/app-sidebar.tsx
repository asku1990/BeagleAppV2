"use client";

import Link from "next/link";
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
  UserCircle2,
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

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const publicNavItems: NavItem[] = [
  { label: "Beagle Search", icon: Search },
  { label: "Owner Search", icon: Users },
  { label: "Trial Results", icon: FileSearch },
  { label: "Field Trials", icon: Flag },
  { label: "Shows", icon: Award },
  { label: "EK Dogs", icon: Dog },
  { label: "Kennel Names", icon: PawPrint },
  { label: "Virtual Pairing", icon: Activity },
  { label: "Best Driver", icon: Shield },
];

export function AppSidebar() {
  const isAdmin = false;
  const isAuthed = false;

  const handleComingSoon = (item: string) => {
    toast(`${item}: not implemented yet`);
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-[var(--beagle-border)]">
        <div className="flex min-h-12 items-center px-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="beagle-title text-lg">Main Menu</p>
            <p className="beagle-subtitle">Beagle Database</p>
          </div>
          <p className="hidden text-sm font-semibold text-[var(--beagle-ink)] group-data-[collapsible=icon]:block">
            SB
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    onClick={() => handleComingSoon(item.label)}
                    className="text-[var(--beagle-ink)]"
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Admin Panel">
                    <Shield className="size-4" />
                    <span>Admin Panel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-[var(--beagle-border)]">
        {isAuthed ? (
          <div className="flex items-center gap-2 px-2 py-1">
            <UserCircle2 className="size-5 text-[var(--beagle-ink)]" />
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-[var(--beagle-ink)]">
                User
              </p>
              <p className="text-xs text-[var(--beagle-muted)]">Account</p>
            </div>
          </div>
        ) : (
          <Button
            asChild
            variant="ghost"
            className="justify-start gap-2 text-[var(--beagle-ink)] group-data-[collapsible=icon]:justify-center"
          >
            <Link href="/login">
              <LogIn className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Sign in
              </span>
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
