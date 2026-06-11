export const beagleTheme = {
  panel: "beagle-panel",
  subpanel: "beagle-subpanel",
  inkText: "text-[var(--beagle-ink)]",
  inkStrongText: "text-[var(--beagle-ink-2)]",
  mutedText: "text-[var(--beagle-muted)]",
  border: "border-(--beagle-border)",
  surface: "bg-(--beagle-surface)",
  sidebarSurface: "bg-[var(--beagle-sidebar-surface)]",
  softAccent: "bg-(--beagle-accent-soft)",
  headingLg: "text-3xl font-semibold leading-tight tracking-tight md:text-4xl",
  headingMd: "text-xl font-semibold tracking-tight",
  headingSm: "text-base font-semibold tracking-tight",
  labelSm: "text-sm leading-5",
  focusRing: "beagle-focus-ring",
  textLink: "underline-offset-2 hover:underline text-[var(--beagle-ink-2)]",
  entityLink:
    "font-medium underline-offset-2 hover:underline text-[var(--beagle-ink-2)]",
  actionLink:
    "cursor-pointer underline-offset-2 hover:underline text-[var(--beagle-ink-2)]",
  actionLinkStrong:
    "cursor-pointer font-medium underline-offset-2 hover:underline text-[var(--beagle-ink-2)]",
  interactive: "transition-colors duration-150 hover:bg-(--beagle-accent-soft)",
} as const;
