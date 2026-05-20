import type { Metadata } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import { Suspense } from "react";

import { RootChrome } from "@/components/layout/RootChrome";
import { siteConfig } from "@/config/site";

import "./globals.css";

const heading = Lexend({
  variable: "--font-sans-heading",
  subsets: ["latin"],
  display: "swap",
});

const body = Source_Sans_3({
  variable: "--font-sans-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} · Motor claims`,
    description: siteConfig.description,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-[var(--color-ink)]">
        <Suspense fallback={<>{children}</>}>
          <RootChrome>{children}</RootChrome>
        </Suspense>
      </body>
    </html>
  );
}
