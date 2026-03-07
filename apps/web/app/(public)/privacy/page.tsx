import { beagleTheme } from "@/components/ui/beagle-theme";
import { CookieChoicesButton } from "@/components/privacy";
import { cn } from "@/lib/utils";

const lastUpdated = "2026-03-07";

export default function PrivacyPage() {
  return (
    <section
      className={cn(
        beagleTheme.panel,
        "scroll-mt-16 px-5 py-5 md:px-6 md:py-6",
      )}
    >
      <h1 className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}>
        Privacy
      </h1>
      <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
        This page describes the current minimum privacy baseline for this site.
        Final legal wording and policy review are still pending.
      </p>

      <div className="mt-6 space-y-6">
        <section>
          <h2 className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}>
            Functional storage currently in use
          </h2>
          <ul
            className={cn("mt-2 list-disc space-y-1 pl-5", beagleTheme.inkText)}
          >
            <li>
              Locale preference is stored in `beagle.locale` (cookie and
              localStorage).
            </li>
            <li>
              Sidebar open/collapsed state is stored in `sidebar_state` cookie.
            </li>
          </ul>
        </section>

        <section>
          <h2 className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}>
            Authentication and session cookies
          </h2>
          <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
            Authentication is handled with Better Auth and uses session cookies
            required for sign-in and account access.
          </p>
        </section>

        <section>
          <h2 className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}>
            Optional analytics and performance measurement
          </h2>
          <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
            Vercel Analytics and Vercel Speed Insights are optional and are only
            enabled after explicit acceptance through the consent banner.
          </p>
          <CookieChoicesButton />
        </section>

        <section>
          <h2 className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}>
            Data retention
          </h2>
          <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
            TODO: confirm and document exact retention periods for each data
            category.
          </p>
        </section>

        <section>
          <h2 className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}>
            Your rights and contact details
          </h2>
          <p className={cn("mt-2 text-sm md:text-base", beagleTheme.inkText)}>
            TODO: add final controller details, contact channels, and data
            subject rights process.
          </p>
        </section>
      </div>

      <p className={cn("mt-8 text-xs md:text-sm", beagleTheme.mutedText)}>
        Last updated: {lastUpdated}
      </p>
    </section>
  );
}
