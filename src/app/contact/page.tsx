import type { Metadata } from "next";
import { siteConfig } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Prince Parfait GANZA for freelance projects, technical consulting, speaking engagements, and collaborations.",
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: "Contact — Prince Parfait GANZA",
    description:
      "Reach out to Prince Parfait GANZA for projects, consulting, speaking, and collaborations.",
    url: `${siteConfig.url}/contact`,
  },
};

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Prince Parfait GANZA",
  url: `${siteConfig.url}/contact`,
  description: "Contact page for Prince Parfait GANZA",
  mainEntity: {
    "@type": "Person",
    name: "Prince Parfait GANZA",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Professional",
      email: siteConfig.contact.email,
      availableLanguage: ["English", "French", "Kinyarwanda"],
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
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
