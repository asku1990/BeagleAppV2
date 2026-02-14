import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Providers } from "@/lib/providers";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocale } from "@/lib/i18n/types";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suomen Beaglejärjestö- Finska Beagleklubben r.y.",
  description: "Suomen Beaglejärjestö- Finska Beagleklubben r.y. tietokanta",
  icons: {
    icon: "/legacy-v1-assets/v1-root-favicon.ico",
    shortcut: "/legacy-v1-assets/v1-root-favicon.ico",
    apple: "/dog_15997414.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const initialLocale =
    localeCookie && isLocale(localeCookie) ? localeCookie : undefined;
  const htmlLocale = initialLocale ?? DEFAULT_LOCALE;

  return (
    <html lang={htmlLocale}>
      <body className="antialiased">
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
