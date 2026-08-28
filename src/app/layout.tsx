import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/layout/LayoutShell";
import { siteConfig } from "@/data/site-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { OG_IMAGE_PATH, buildIdentityGraph, canonicalUrl } from "@/lib/schema";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.princeparfait.com"),
  title: {
    default: "Prince Parfait GANZA | Founder & Software Engineer",
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
    title: "Prince Parfait GANZA | Founder & Software Engineer",
    description: siteConfig.description,
    siteName: "Prince Parfait GANZA",
    images: [
      {
        url: OG_IMAGE_PATH,
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
    title: "Prince Parfait GANZA | Founder & Software Engineer",
    description: siteConfig.description,
    images: [OG_IMAGE_PATH],
  },
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
  manifest: "/site.webmanifest",
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
    { media: "(prefers-color-scheme: dark)", color: "#050816" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" id="top" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`,
          }}
        />
        <JsonLd data={buildIdentityGraph()} />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#0E52A8" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${outfit.variable} antialiased`} suppressHydrationWarning>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
