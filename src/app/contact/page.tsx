import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const PAGE_DESCRIPTION =
  "Contact Prince Parfait GANZA about a venture, a product, or a system that needs to exist. Based in Kigali. Email hello@princeparfait.com.";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/contact",
  absoluteTitle: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

export default function ContactPage() {
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
        ])}
      />
      <ContactForm />
    </>
  );
}
