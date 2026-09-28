import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildFaqPageJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import { contactPageFrom } from "@/lib/contact-page";

const PAGE_DESCRIPTION =
  "Contact Prince Parfait GANZA in Kigali — software engineer and technology entrepreneur — about software systems, research technology, data systems, or a venture that needs to exist. Email hello@princeparfait.com.";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Prince Parfait GANZA | Software Engineer & Technology Entrepreneur Kigali",
  description: PAGE_DESCRIPTION,
  path: "/contact",
  absoluteTitle: true,
  keywords: [
    "Contact Prince Parfait GANZA",
    "Hire software engineer Kigali",
    "Software engineer Rwanda contact",
    "Research technology Rwanda",
    "LERONY Ltd contact",
    "Technology entrepreneur Kigali",
  ],
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

export default async function ContactPage() {
  const settings = await getServerSiteSettings();
  const faq = buildFaqPageJsonLd(contactPageFrom(settings).faq.items);
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/contact",
            name: "Contact Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
            type: "ContactPage",
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/contact"),
          ...(faq ? [faq] : []),
        ])}
      />
      <ContactForm />
    </>
  );
}
