import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Providers } from "@/lib/providers";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocale } from "@/lib/i18n/types";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beagle v2",
  description: "Beagle v2 platform",
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
