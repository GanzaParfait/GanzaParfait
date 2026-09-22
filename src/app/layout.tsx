import type { Metadata, Viewport } from "next";
import { Caveat, Outfit, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LayoutShell from "@/components/layout/LayoutShell";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import { siteConfig } from "@/data/site-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGE_PATH, buildIdentityGraph, canonicalUrl } from "@/lib/schema";
import { getServerSiteSettings } from "@/lib/site-settings-server";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cv-serif",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  preload: false,
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-script",
  preload: false,
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.princeparfait.com"),
  title: {
    default: "Prince Parfait GANZA | Founder, Entrepreneur & Technologist",
    template: `%s | Prince Parfait GANZA`,
  },
  description: siteConfig.description,
  applicationName: "Prince Parfait GANZA",
  authors: [{ name: "Prince Parfait GANZA", url: canonicalUrl("/") }],
  creator: "Prince Parfait GANZA",
  publisher: "Prince Parfait GANZA",
  category: "technology",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Prince Parfait GANZA | Founder, Entrepreneur & Technologist",
    description: siteConfig.description,
    siteName: "Prince Parfait GANZA",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Prince Parfait GANZA, founder, entrepreneur, technologist and software engineer in Kigali",
        type: "image/jpeg",
      },
      {
        url: "/images/og/prince-parfait-ganza.jpg",
        width: 1200,
        height: 630,
        alt: "Prince Parfait GANZA",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@prince_parfait1",
    creator: "@prince_parfait1",
    title: "Prince Parfait GANZA | Founder, Entrepreneur & Technologist",
    description: siteConfig.description,
    images: [OG_IMAGE_PATH],
  },
  icons: {
    apple: [{ url: "/apple-touch-icon.png?v=20260919", sizes: "180x180" }],
    other: [{ rel: "manifest", url: "/site.webmanifest?v=20260919c" }],
  },
  manifest: "/site.webmanifest?v=20260919c",
  ...(googleVerification || bingVerification
    ? {
        verification: {
          ...(googleVerification ? { google: googleVerification } : {}),
          ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
        },
      }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getServerSiteSettings();

  return (
    <html lang="en" dir="ltr" id="top" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <JsonLd data={buildIdentityGraph()} />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260919b" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="dns-prefetch" href="https://edhuizzkjdziurqnidks.supabase.co" />
        <link rel="preconnect" href="https://edhuizzkjdziurqnidks.supabase.co" crossOrigin="" />
      </head>
      <body className={`${outfit.variable} ${sourceSerif.variable} ${caveat.variable} antialiased`} suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem('theme')==='dark';var c='#ffffff';document.documentElement.setAttribute('data-theme',d?'dark':'light');document.documentElement.style.colorScheme=d?'dark':'light';var m=document.querySelectorAll('meta[name="theme-color"]');if(!m.length){var n=document.createElement('meta');n.setAttribute('name','theme-color');n.setAttribute('content',c);document.head.appendChild(n);}else{m.forEach(function(el){el.setAttribute('content',c);});}}catch(e){}})();`,
          }}
        />
        <SiteSettingsProvider initial={settings}>
          <LayoutShell>{children}</LayoutShell>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
