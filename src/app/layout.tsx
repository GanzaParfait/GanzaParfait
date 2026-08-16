import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import LayoutShell from "@/components/layout/LayoutShell";
import { siteConfig } from "@/data/site-data";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | Prince Parfait GANZA`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "Prince Parfait GANZA", url: siteConfig.url }],
  creator: "Prince Parfait GANZA",
  publisher: "Prince Parfait GANZA",
  category: "technology",
  classification: "Portfolio, Software Engineering, AI",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Prince Parfait GANZA — Founder • Software Engineer • AI Builder",
    description: siteConfig.description,
    siteName: "Prince Parfait GANZA",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prince Parfait GANZA — Founder, Software Engineer, AI Builder, Speaker & Entrepreneur from Rwanda",
        type: "image/png",
        secureUrl: `${siteConfig.url}/og-image.png`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@_prince_parfait_1",
    title: "Prince Parfait GANZA — Founder • Software Engineer • AI Builder",
    description: siteConfig.description,
    creator: "@_prince_parfait_1",
    images: [
      {
        url: "/og-image.png",
        alt: "Prince Parfait GANZA — Founder, Software Engineer, AI Builder",
        width: 1200,
        height: 630,
      },
    ],
  },
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
  manifest: "/site.webmanifest",
  alternates: { canonical: siteConfig.url },
  other: {
    // WhatsApp-specific — WhatsApp uses og:image but needs absolute URL
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/png",
    // LinkedIn
    "linkedin:owner": "ganza-prince-235816269",
  },
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

// Structured Data — Person + Website
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: "Prince Parfait GANZA",
      alternateName: ["Prince Parfait", "PPG", "GANZA Prince"],
      description: siteConfig.description,
      url: siteConfig.url,
      image: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/brand/logos/logo-horizontal-blue.png`,
        width: 1200,
        height: 400,
      },
      jobTitle: "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
      worksFor: {
        "@type": "Organization",
        name: "Lerony",
        url: "https://lerony.com",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kigali",
        addressCountry: "RW",
      },
      sameAs: [
        siteConfig.social.github,
        siteConfig.social.linkedin,
        siteConfig.social.twitter,
        siteConfig.social.youtube,
        siteConfig.social.instagram,
        siteConfig.social.tiktok,
        siteConfig.social.threads,
        siteConfig.social.luma,
        siteConfig.social.buymeacoffee,
      ],
      knowsAbout: [
        "Software Engineering",
        "Artificial Intelligence",
        "Web Development",
        "React",
        "Next.js",
        "TypeScript",
        "Entrepreneurship",
        "Public Speaking",
        "Technology",
      ],
      nationality: { "@type": "Country", name: "Rwanda" },
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      publisher: { "@id": `${siteConfig.url}/#person` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" id="top" data-theme="light">
      <head>
        {/* Anti-FOUC: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Force site favicon — prevents platform-injected icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#0E52A8" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${outfit.variable} antialiased`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
