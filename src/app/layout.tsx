import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/layout/LayoutShell";
import { siteConfig } from "@/data/site-data";
import { DEFAULT_OG_IMAGE, PPG_SEO_KEYWORDS } from "@/lib/seo";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Prince Parfait GANZA (PPG) — Founder • Software Engineer • AI Builder",
    template: `%s | Prince Parfait GANZA (PPG)`,
  },
  description: `${siteConfig.description} Official portfolio of Prince Parfait GANZA (PPG) — search PPG Rwanda, PPG developer, or princeparfait.com.`,
  keywords: [...siteConfig.keywords, ...PPG_SEO_KEYWORDS],
  applicationName: "Prince Parfait GANZA (PPG)",
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
    title: "Prince Parfait GANZA (PPG) — Founder • Software Engineer • AI Builder",
    description: siteConfig.description,
    siteName: "Prince Parfait GANZA (PPG)",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Prince Parfait GANZA (PPG) — Founder, Software Engineer, AI Builder from Rwanda",
        type: "image/png",
        secureUrl: `${siteConfig.url}${DEFAULT_OG_IMAGE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@prince_parfait1",
    title: "Prince Parfait GANZA (PPG) — Founder • Software Engineer • AI Builder",
    description: siteConfig.description,
    creator: "@prince_parfait1",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: "Prince Parfait GANZA (PPG) — Founder, Software Engineer, AI Builder",
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

// Structured Data — Person + Website (Industrial-Grade Knowledge Graph Schema)
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Person", "Brand"],
      "@id": `${siteConfig.url}/#person`,
      name: "Prince Parfait GANZA",
      alternateName: [
        "PPG",
        "Prince Parfait GANZA PPG",
        "PPG Rwanda",
        "PPG developer",
        "PPG software engineer",
        "Prince Parfait",
        "GANZA Prince",
        "Prince Parfait Ishimwe",
        "Prince Parfait Ganza",
      ],
      description: siteConfig.description,
      url: siteConfig.url,
      image: {
        "@type": "ImageObject",
        "@id": `${siteConfig.url}/#primaryimage`,
        url: `${siteConfig.url}/images/profile/hero-photo.png`,
        width: 1200,
        height: 1200,
        caption: "Prince Parfait GANZA"
      },
      jobTitle: [
        "Software Engineer",
        "Founder",
        "CEO",
        "AI Builder"
      ],
      worksFor: {
        "@type": "Organization",
        name: "Lerony",
        url: "https://lerony.com"
      },
      founder: [
        {
          "@type": "Organization",
          name: "Lerony",
          url: "https://lerony.com"
        }
      ],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Kigali Independent University ULK"
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
        "https://trenely.com",
        "https://princeparfait.com"
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
        "Business Automation",
        "PPG",
        "Rwanda technology",
      ],
      nationality: { "@type": "Country", name: "Rwanda" },
      gender: "Male",
      mainEntityOfPage: {
        "@type": "ProfilePage",
        "@id": siteConfig.url
      }
    },
    {
      "@type": "Organization",
      "@id": "https://lerony.com/#organization",
      name: "Lerony",
      url: "https://lerony.com",
      founder: { "@id": `${siteConfig.url}/#person` },
      sameAs: ["https://lerony.com"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: "Prince Parfait GANZA (PPG)",
      alternateName: ["PPG", "princeparfait.com", "Prince Parfait GANZA Portfolio"],
      description: siteConfig.description,
      publisher: { "@id": `${siteConfig.url}/#person` },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" id="top" data-theme="light" suppressHydrationWarning>
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
        <link rel="alternate" type="application/rss+xml" title="PPG Blog RSS" href="/feed.xml" />
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
