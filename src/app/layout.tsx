import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ganzaparfait.com"),
  title: {
    default: "Prince Parfait GANZA | CEO & Technical Founder | Software Engineering & Digital Transformation",
    template: "%s | Prince Parfait GANZA",
  },
  description:
    "Prince Parfait GANZA is a technical founder, CEO of Lerony Co. Ltd, and ALX-certified expert in Data Analytics and Software Engineering. Specializing in digital transformation, process automation, and scalable tech solutions.",
  keywords: [
    "Prince Parfait GANZA",
    "Lerony Co. Ltd",
    "CEO Software Engineer",
    "Technical Founder Rwanda",
    "Digital Transformation Expert",
    "Data Analytics ALX",
    "Software Engineering Africa",
    "IT Solutions Rwanda",
    "Technical Leadership",
    "Full Stack Developer Rwanda",
    "Startup Founder",
    "Web Architecture",
  ],
  authors: [{ name: "Prince Parfait GANZA", url: "https://ganzaparfait.com" }],
  creator: "Prince Parfait GANZA",
  publisher: "Prince Parfait GANZA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ganzaparfait.com",
    siteName: "Prince Parfait GANZA Portfolio",
    title: "Prince Parfait GANZA | CEO & Technical Founder",
    description:
      "Technical Founder & CEO driving digital transformation, automation, and scalable engineering solutions across Africa and beyond.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prince Parfait GANZA - CEO & Technical Founder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prince Parfait GANZA | CEO & Technical Founder",
    description:
      "Technical Founder & CEO driving digital transformation, automation, and scalable engineering solutions across Africa and beyond.",
    images: ["/og-image.png"],
    creator: "@GanzaParfait",
  },
  alternates: {
    canonical: "https://ganzaparfait.com",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#080b12" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Prince Parfait GANZA",
              jobTitle: "CEO & Founder",
              worksFor: {
                "@type": "Organization",
                name: "Lerony Co. Ltd",
              },
              description:
                "Technical founder and CEO specializing in software engineering, digital transformation, and data analytics.",
              url: "https://ganzaparfait.com",
              sameAs: ["https://github.com/GanzaParfait"],
            }),
          }}
        />
      </head>
      <body className="font-[var(--font-inter)] antialiased">{children}</body>
    </html>
  );
}
