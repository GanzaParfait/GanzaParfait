import type { Metadata } from "next";
import { siteConfig } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ContactForm from "./ContactForm";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact PPG — Hire Prince Parfait GANZA",
  description:
    "Contact Prince Parfait GANZA (PPG) for freelance projects, AI consulting, speaking engagements, and collaborations in Rwanda and globally.",
  path: "/contact",
  keywords: ["Contact PPG", "Hire Prince Parfait GANZA", "PPG consulting", "software engineer Rwanda contact"],
});

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Prince Parfait GANZA",
  url: `${siteConfig.url}/contact`,
  description: "Contact page for Prince Parfait GANZA",
  mainEntity: {
    "@type": "Person",
    name: "Prince Parfait GANZA",
    alternateName: ["PPG", "Prince Parfait GANZA PPG"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Professional",
      email: siteConfig.contact.email,
      availableLanguage: ["English", "French", "Kinyarwanda"],
    },
  },
};

export default function ContactPage() {
  const schema = [
    contactPageSchema,
    buildWebPageJsonLd({
      name: "Contact Prince Parfait GANZA (PPG)",
      description: "Get in touch with PPG for projects, consulting, and speaking.",
      path: "/contact",
    }),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section
        className="section pt-32 relative dot-grid overflow-hidden min-h-screen"
        aria-label="Contact section"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-radial pointer-events-none" />
        <div className="container relative z-10">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
