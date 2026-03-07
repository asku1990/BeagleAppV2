"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Dog,
  FileText,
  FileSearch,
  House,
  Link2,
  LogIn,
  LogOut,
  PawPrint,
  Search,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { beagleTheme } from "@/components/ui/beagle-theme";
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
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n";
import { useI18n } from "@/hooks/i18n";
import { authClient } from "@/lib/auth/auth-client";

type NavItem = {
  labelKey: MessageKey;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
};

type SessionUserWithOptionalRole = {
  role?: string | null;
};

const publicNavItems: NavItem[] = [
  { labelKey: "sidebar.nav.home", icon: House, href: "/" },
  {
    labelKey: "sidebar.nav.beagleSearch",
    icon: Search,
    href: "/beagle/search",
  },
  { labelKey: "sidebar.nav.ownerSearch", icon: Users },
  {
    labelKey: "sidebar.nav.trialResults",
    icon: FileSearch,
    href: "/beagle/trials",
  },
  { labelKey: "sidebar.nav.shows", icon: Award, href: "/beagle/shows" },
  { labelKey: "sidebar.nav.ekDogs", icon: Dog },
  { labelKey: "sidebar.nav.kennelNames", icon: PawPrint },
  { labelKey: "sidebar.nav.virtualPairing", icon: Link2 },
  { labelKey: "sidebar.nav.bestDriver", icon: Trophy },
];

const adminNavItem: NavItem = {
  labelKey: "sidebar.nav.admin",
  icon: Shield,
  href: "/admin",
};

const adminModuleNavItems: NavItem[] = [
  { labelKey: "sidebar.nav.adminUsers", icon: Users, href: "/admin/users" },
  { labelKey: "sidebar.nav.adminDogs", icon: Dog, href: "/admin/dogs" },
  {
    labelKey: "sidebar.nav.adminSettings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AppSidebar() {
  const { t } = useI18n();
  const router = useRouter();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleComingSoon = (item: string) => {
    closeSidebarOnMobile();
    toast.info(`${item}: ${t("common.notImplementedYet")}`);
  };

  const handleSignOut = async () => {
    closeSidebarOnMobile();
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message ?? t("auth.signOut.error"));
      return;
    }

    toast.success(t("auth.signOut.success"));
    router.push("/");
    router.refresh();
  };

  const isSignedIn = Boolean(session?.user);
  const userRole = (session?.user as SessionUserWithOptionalRole | undefined)
    ?.role;
  const isAdmin = userRole === "ADMIN";
  const userEmail = session?.user?.email ?? null;
  const userName = session?.user?.name ?? null;
  const accountPrimary =
    userName?.trim() || userEmail || t("sidebar.account.signedInFallback");
  const accountSecondary = userName?.trim() ? userEmail : null;
  const accountRole = isAdmin
    ? t("sidebar.account.roleAdmin")
    : t("sidebar.account.roleUser");

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className={cn("gap-0 border-b p-0", beagleTheme.border)}>
        <div
          data-testid="sidebar-title"
          className={
            state === "collapsed"
              ? "flex h-12 items-center justify-center px-0"
              : "flex h-12 items-center px-4"
          }
        >
          {state === "collapsed" ? (
            <Link
              href="/"
              onClick={closeSidebarOnMobile}
              className={cn(
                "text-xs font-semibold leading-none tracking-wide uppercase",
                beagleTheme.inkStrongText,
                beagleTheme.focusRing,
              )}
            >
              {t("sidebar.shortTitle")}
            </Link>
          ) : (
            <Link
              href="/"
              onClick={closeSidebarOnMobile}
              className={cn(
                "leading-none",
                beagleTheme.headingSm,
                beagleTheme.inkStrongText,
                beagleTheme.focusRing,
              )}
            >
              {t("sidebar.title")}
            </Link>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {publicNavItems.map((item) => (
                <SidebarMenuItem key={item.labelKey}>
                  {item.href ? (
                    <SidebarMenuButton
                      asChild
                      tooltip={t(item.labelKey)}
                      isActive={
                        item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.href)
                      }
                      className={cn(
                        beagleTheme.inkStrongText,
                        beagleTheme.interactive,
                        beagleTheme.focusRing,
                        "min-h-11 md:min-h-9",
                        "data-[active=true]:bg-[var(--beagle-accent-soft)]",
                      )}
                    >
                      <Link href={item.href} onClick={closeSidebarOnMobile}>
                        <item.icon className="size-4" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      tooltip={t(item.labelKey)}
                      onClick={() => handleComingSoon(t(item.labelKey))}
                      className={cn(
                        beagleTheme.inkStrongText,
                        beagleTheme.interactive,
                        beagleTheme.focusRing,
                        "min-h-11 md:min-h-9",
                        "data-[active=true]:bg-[var(--beagle-accent-soft)]",
                      )}
                    >
                      <item.icon className="size-4" />
                      <span>{t(item.labelKey)}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
              {isAdmin ? (
                <>
                  <SidebarMenuItem className="my-1 border-t border-[var(--beagle-border)] pt-1">
                    <span
                      className={cn(
                        "block px-2 py-1 text-xs font-semibold tracking-wide uppercase group-data-[collapsible=icon]:hidden",
                        beagleTheme.mutedText,
                      )}
                    >
                      {t("sidebar.adminSection")}
                    </span>
                  </SidebarMenuItem>
                  <SidebarMenuItem key={adminNavItem.labelKey}>
                    <SidebarMenuButton
                      asChild
                      tooltip={t(adminNavItem.labelKey)}
                      isActive={pathname === (adminNavItem.href ?? "/admin")}
                      className={cn(
                        beagleTheme.inkStrongText,
                        beagleTheme.interactive,
                        beagleTheme.focusRing,
                        "min-h-11 md:min-h-9",
                        "data-[active=true]:bg-[var(--beagle-accent-soft)]",
                      )}
                    >
                      <Link
                        href={adminNavItem.href ?? "/admin"}
                        onClick={closeSidebarOnMobile}
                      >
                        <adminNavItem.icon className="size-4" />
                        <span>{t(adminNavItem.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {adminModuleNavItems.map((item) => (
                    <SidebarMenuItem key={item.labelKey}>
                      <SidebarMenuButton
                        asChild
                        tooltip={t(item.labelKey)}
                        isActive={pathname.startsWith(item.href ?? "/admin")}
                        className={cn(
                          beagleTheme.inkStrongText,
                          beagleTheme.interactive,
                          beagleTheme.focusRing,
                          "min-h-11 md:min-h-9",
                          "data-[active=true]:bg-[var(--beagle-accent-soft)]",
                        )}
                      >
                        <Link
                          href={item.href ?? "/admin"}
                          onClick={closeSidebarOnMobile}
                        >
                          <item.icon className="size-4" />
                          <span>{t(item.labelKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "mt-auto border-t group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0",
          beagleTheme.border,
        )}
      >
        {isSignedIn ? (
          <>
            <div
              className={cn(
                "mx-2 mb-1 rounded-md border px-2 py-2 group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:px-0",
                beagleTheme.border,
              )}
            >
              <div className="flex items-start gap-2 group-data-[collapsible=icon]:hidden">
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    beagleTheme.border,
                    beagleTheme.softAccent,
                  )}
                >
                  <User className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <Link
                    href="/account/profile"
                    onClick={closeSidebarOnMobile}
                    className={cn(
                      "block truncate text-sm font-medium underline-offset-2 hover:underline",
                      beagleTheme.inkStrongText,
                      beagleTheme.focusRing,
                    )}
                  >
                    {accountPrimary}
                  </Link>
                  {accountSecondary ? (
                    <p
                      className={cn("truncate text-xs", beagleTheme.mutedText)}
                    >
                      {accountSecondary}
                    </p>
                  ) : null}
                  <p
                    className={cn(
                      "mt-0.5 text-[11px] font-semibold",
                      beagleTheme.mutedText,
                    )}
                  >
                    {accountRole}
                  </p>
                </div>
              </div>
              <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  asChild
                  tooltip={`${accountPrimary} (${accountRole})`}
                  className={cn(
                    "h-7 w-7 justify-center rounded-full border p-0",
                    beagleTheme.border,
                    beagleTheme.softAccent,
                    beagleTheme.focusRing,
                  )}
                >
                  <Link href="/account/profile" onClick={closeSidebarOnMobile}>
                    <User className="size-3.5" />
                    <span className="sr-only">{`${accountPrimary} (${accountRole})`}</span>
                  </Link>
                </SidebarMenuButton>
              </div>
            </div>
            <SidebarMenuButton
              tooltip={t("sidebar.signOut")}
              className={cn(
                beagleTheme.inkStrongText,
                beagleTheme.interactive,
                beagleTheme.focusRing,
                "min-h-11 md:min-h-9",
              )}
              onClick={handleSignOut}
              disabled={isSessionPending}
            >
              <LogOut className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                {t("sidebar.signOut")}
              </span>
            </SidebarMenuButton>
          </>
        ) : (
          <SidebarMenuButton
            asChild
            tooltip={t("sidebar.signIn")}
            isActive={pathname === "/sign-in"}
            className={cn(
              beagleTheme.inkStrongText,
              beagleTheme.interactive,
              beagleTheme.focusRing,
              "min-h-11 md:min-h-9",
              "data-[active=true]:bg-[var(--beagle-accent-soft)]",
            )}
          >
            <Link href="/sign-in" onClick={closeSidebarOnMobile}>
              <LogIn className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                {t("sidebar.signIn")}
              </span>
            </Link>
          </SidebarMenuButton>
        )}

        <SidebarMenu className="mt-1 border-t border-[var(--beagle-border)] pt-1">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              asChild
              tooltip="Privacy"
              isActive={pathname === "/privacy"}
              className={cn(
                beagleTheme.inkStrongText,
                beagleTheme.interactive,
                beagleTheme.focusRing,
                "min-h-11 md:min-h-9",
                "data-[active=true]:bg-[var(--beagle-accent-soft)]",
              )}
            >
              <Link href="/privacy" onClick={closeSidebarOnMobile}>
                <FileText className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Privacy
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
